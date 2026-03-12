import React, { useState, useEffect, useRef, useCallback } from 'react'
import { t, setLocale, type Locale } from '../../shared/i18n'
import { getPreferences, getLLMConfig } from '../../shared/storage'
import type { AgentActivityData, HistoryItem, MessageType, LLMConfig } from '../../shared/types'
import Header from './components/Header'
import StatusBar from './components/StatusBar'
import ChatArea from './components/ChatArea'
import InputBar from './components/InputBar'
import BottomBar from './components/BottomBar'
import './styles/sidepanel.css'

export interface ChatMessage {
  id: string
  role: 'user' | 'agent' | 'result'
  content?: string
  steps?: AgentStep[]
  success?: boolean
}

export interface AgentStep {
  type: 'thinking' | 'executing' | 'executed' | 'retrying' | 'error'
  tool?: string
  input?: unknown
  output?: string
  duration?: number
  message?: string
  thought?: string
}

export default function SidePanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const [config, setConfig] = useState<LLMConfig | null>(null)
  const [language, setLanguage] = useState<Locale>('zh-CN')
  const [isRecording, setIsRecording] = useState(false)

  // Load config on mount
  useEffect(() => {
    async function init() {
      const prefs = await getPreferences()
      const llm = await getLLMConfig()
      setLanguage(prefs.language)
      setLocale(prefs.language)
      setConfig(llm)
    }
    init()
  }, [])

  // Listen for messages from background/content script
  useEffect(() => {
    function handleMessage(msg: MessageType) {
      switch (msg.type) {
        case 'AGENT_STATUS':
          setStatus(msg.status)
          break

        case 'AGENT_ACTIVITY': {
          const act = msg.activity
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            if (last?.role === 'agent') {
              const step: AgentStep = {
                type: act.type,
                tool: act.tool,
                input: act.input,
                output: act.output,
                duration: act.duration,
                message: act.message,
              }
              return [
                ...prev.slice(0, -1),
                { ...last, steps: [...(last.steps ?? []), step] },
              ]
            }
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'agent',
                steps: [{ type: act.type, tool: act.tool, input: act.input, output: act.output, duration: act.duration, message: act.message }],
              },
            ]
          })
          break
        }

        case 'AGENT_RESULT':
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: 'result',
              content: msg.data,
              success: msg.success,
            },
          ])
          break

        case 'RECORDING_DATA':
          setIsRecording(false)
          break
      }
    }

    chrome.runtime.onMessage.addListener(handleMessage)
    return () => chrome.runtime.onMessage.removeListener(handleMessage)
  }, [])

  const handleSend = useCallback(
    (text: string) => {
      if (!text.trim() || status === 'running') return
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'user', content: text },
      ])
      chrome.runtime.sendMessage({ type: 'EXECUTE_TASK', task: text })
    },
    [status]
  )

  const handleStop = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'STOP_TASK' })
  }, [])

  const handleQuickAction = useCallback(
    (instruction: string) => {
      handleSend(instruction)
    },
    [handleSend]
  )

  const handleRecord = useCallback(() => {
    if (isRecording) {
      chrome.runtime.sendMessage({ type: 'STOP_RECORDING' })
      setIsRecording(false)
    } else {
      chrome.runtime.sendMessage({ type: 'START_RECORDING' })
      setIsRecording(true)
    }
  }, [isRecording])

  const handleSettings = useCallback(() => {
    chrome.runtime.openOptionsPage()
  }, [])

  return (
    <div className="side-panel">
      <Header onSettings={handleSettings} />
      <StatusBar model={config?.model ?? '—'} connected={!!config} />
      <ChatArea messages={messages} status={status} language={language} />
      <InputBar
        onSend={handleSend}
        onStop={handleStop}
        isRunning={status === 'running'}
        language={language}
      />
      <BottomBar
        language={language}
        isRecording={isRecording}
        onQuickAction={handleQuickAction}
        onRecord={handleRecord}
      />
    </div>
  )
}
