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
  chrome.runtime.sendMessage({
    type: 'AGENT_STATUS',
    status: 'running',
  } as MessageType)

  for (const action of actions) {
    try {
      const el = document.querySelector(action.selector)
      if (!el) {
        chrome.runtime.sendMessage({
          type: 'AGENT_ACTIVITY',
          activity: { type: 'error', message: `Element not found: ${action.selector}` },
        } as MessageType)
        continue
      }

      chrome.runtime.sendMessage({
        type: 'AGENT_ACTIVITY',
        activity: { type: 'executing', tool: action.type, input: action.description },
      } as MessageType)

      switch (action.type) {
        case 'click':
          (el as HTMLElement).click()
          break
        case 'input':
          (el as HTMLInputElement).value = action.value ?? ''
          el.dispatchEvent(new Event('input', { bubbles: true }))
          break
        case 'select':
          (el as HTMLSelectElement).value = action.value ?? ''
          el.dispatchEvent(new Event('change', { bubbles: true }))
          break
      }

      chrome.runtime.sendMessage({
        type: 'AGENT_ACTIVITY',
        activity: { type: 'executed', tool: action.type, input: action.description, output: 'OK', duration: 0 },
      } as MessageType)

      // Small delay between actions for visibility
      await new Promise((r) => setTimeout(r, 300))
    } catch (err: any) {
      chrome.runtime.sendMessage({
        type: 'AGENT_ACTIVITY',
        activity: { type: 'error', message: err.message },
      } as MessageType)
    }
  }

  chrome.runtime.sendMessage({
    type: 'AGENT_RESULT',
    success: true,
    data: 'Replay completed',
  } as MessageType)
}

console.log('[Page Agent] Content script loaded')
