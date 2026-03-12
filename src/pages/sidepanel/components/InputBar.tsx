import React, { useState, useCallback } from 'react'
import type { Locale } from '../../../shared/i18n'
import { useT } from '../../../shared/i18n'

interface InputBarProps {
  onSend: (text: string) => void
  onStop: () => void
  isRunning: boolean
  language: Locale
}

export default function InputBar({ onSend, onStop, isRunning, language }: InputBarProps) {
  const [text, setText] = useState('')
  const t = useT(language)

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSend(text.trim())
      setText('')
    }
  }, [text, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="input-area">
      <div className="input-row">
        <input
          className="input-field"
          type="text"
          placeholder={t('inputPlaceholder')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
        />
        {isRunning ? (
          <button className="send-btn stop-btn" onClick={onStop} title={t('stop')}>
            <svg className="icon-sm" viewBox="0 0 14 14" fill="currentColor">
              <rect x="3" y="3" width="8" height="8" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            className="send-btn"
            onClick={handleSubmit}
            disabled={!text.trim()}
            title={t('send')}
          >
            <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7 12V2M3 6l4-4 4 4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
