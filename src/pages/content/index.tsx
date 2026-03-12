import type { MessageType, RecordedAction } from '../../shared/types'
import { startRecording, stopRecording } from '../../shared/recorder'
import './style.css'

let agent: any = null
let pageController: any = null

async function initAgent(config: any) {
  // Dynamically import page-agent modules
  const { PageAgentCore } = await import('@page-agent/core')
  const { PageController } = await import('@page-agent/page-controller')

  if (pageController) {
    pageController.dispose()
  }
  if (agent) {
    agent.dispose()
  }

  pageController = new PageController({
    enableMask: true,
    viewportExpansion: 0,
  })

  agent = new PageAgentCore({
    pageController,
    baseURL: config.baseURL,
    apiKey: config.apiKey,
    model: config.model,
    language: config.language || 'zh-CN',
    temperature: config.temperature,
    maxSteps: config.maxSteps || 40,
  })

  // Forward events to Side Panel via background
  agent.addEventListener('statuschange', () => {
    chrome.runtime.sendMessage({
      type: 'AGENT_STATUS',
      status: agent.status,
    })
  })

  agent.addEventListener('activity', (e: CustomEvent) => {
    chrome.runtime.sendMessage({
      type: 'AGENT_ACTIVITY',
      activity: e.detail,
    })
  })

  return agent
}

// Listen for messages from background/sidepanel
chrome.runtime.onMessage.addListener((msg: MessageType, _sender, sendResponse) => {
  switch (msg.type) {
    case 'EXECUTE_TASK':
      handleExecuteTask(msg.task)
      sendResponse({ ok: true })
      break

    case 'STOP_TASK':
      if (agent) agent.stop()
      sendResponse({ ok: true })
      break

    case 'START_RECORDING':
      startRecording()
      sendResponse({ ok: true })
      break

    case 'STOP_RECORDING': {
      const actions = stopRecording()
      chrome.runtime.sendMessage({
        type: 'RECORDING_DATA',
        actions,
      } as MessageType)
      sendResponse({ ok: true, actions })
      break
    }

    case 'REPLAY_RECORDING':
      handleReplay(msg.recording.actions)
      sendResponse({ ok: true })
      break

    case 'CONFIG_DATA':
      initAgent({ ...msg.config, language: msg.preferences.language })
      sendResponse({ ok: true })
      break
  }

  return true // keep channel open for async
})

async function handleExecuteTask(task: string) {
  try {
    // Ensure agent is initialized
    if (!agent) {
      const { getLLMConfig, getPreferences } = await import('../../shared/storage')
      const config = await getLLMConfig()
      const prefs = await getPreferences()
      await initAgent({ ...config, language: prefs.language })
    }

    const result = await agent.execute(task)
    chrome.runtime.sendMessage({
      type: 'AGENT_RESULT',
      success: result.success,
      data: result.data,
    } as MessageType)
  } catch (err: any) {
    chrome.runtime.sendMessage({
      type: 'AGENT_RESULT',
      success: false,
      data: err.message || 'Unknown error',
    } as MessageType)
  }
}

async function handleReplay(actions: RecordedAction[]) {
  // Convert recorded actions into a single natural language instruction
  // and let the AI agent handle element matching intelligently
  const steps = actions.map((a, i) => {
    switch (a.type) {
      case 'click':
        return `Step ${i + 1}: Click the element described as: ${a.elementDescription}. (${a.description})`
      case 'input':
        return `Step ${i + 1}: Type "${a.value}" into the element described as: ${a.elementDescription}. (${a.description})`
      case 'select':
        return `Step ${i + 1}: Select "${a.value}" in the element described as: ${a.elementDescription}. (${a.description})`
      case 'scroll':
        return `Step ${i + 1}: Scroll the page. (${a.description})`
      default:
        return `Step ${i + 1}: ${a.description}`
    }
  })

  const task = `Execute the following steps in order:\n${steps.join('\n')}`

  // Use the AI agent for intelligent replay
  await handleExecuteTask(task)
}

console.log('[Page Agent] Content script loaded')
