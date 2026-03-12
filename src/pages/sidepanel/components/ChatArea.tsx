import React, { useEffect, useRef } from 'react'
import type { ChatMessage } from '../SidePanel'
import type { Locale } from '../../../shared/i18n'
import { useT } from '../../../shared/i18n'
import AgentStep from './AgentStep'

interface ChatAreaProps {
  messages: ChatMessage[]
  status: 'idle' | 'running' | 'completed' | 'error'
  language: Locale
}

export default function ChatArea({ messages, status, language }: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const t = useT(language)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="chat-area">
        <div className="chat-empty">{t('noMessages')}</div>
      </div>
    )
  }

  return (
    <div className="chat-area">
      {messages.map((msg) => {
        if (msg.role === 'user') {
          return (
            <div key={msg.id} className="message message-user">
              <div className="message-content">{msg.content}</div>
            </div>
          )
        }

        if (msg.role === 'agent') {
          return (
            <div key={msg.id} className="message message-agent">
              <div className="message-content">
                {msg.steps?.map((step, i) => (
                  <AgentStep key={i} step={step} language={language} />
                ))}
              </div>
            </div>
          )
        }

        if (msg.role === 'result') {
          return (
            <div
              key={msg.id}
              className={`result-banner ${msg.success ? 'success' : 'failure'}`}
            >
              <span className="step-icon">
                {msg.success ? (
                  <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7.5l2.5 2.5L11 4" />
                  </svg>
                ) : (
                  <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4l6 6M10 4l-6 6" />
                  </svg>
                )}
              </span>
              <span>{msg.content}</span>
            </div>
          )
        }

        return null
      })}
      <div ref={bottomRef} />
    </div>
  )
}
