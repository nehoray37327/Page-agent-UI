import React, { useState, useCallback } from 'react'
import type { Locale } from '../../../shared/i18n'
import { useT } from '../../../shared/i18n'
import { DEFAULT_QUICK_ACTIONS } from '../../../shared/types'

interface BottomBarProps {
  language: Locale
  isRecording: boolean
  onQuickAction: (instruction: string) => void
  onRecord: () => void
}

export default function BottomBar({
  language,
  isRecording,
  onQuickAction,
  onRecord,
}: BottomBarProps) {
  const [showQuickActions, setShowQuickActions] = useState(false)
  const t = useT(language)

  const handleQuickAction = useCallback(
    (instruction: string) => {
      setShowQuickActions(false)
      onQuickAction(instruction)
    },
    [onQuickAction]
  )

  return (
    <>
      <div className="bottom-bar">
        <button
          className="action-chip"
          onClick={() => setShowQuickActions(!showQuickActions)}
        >
          <span className="chip-icon">
            <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M2 7h10M7 2l5 5-5 5" />
            </svg>
          </span>
          {t('quickActions')}
        </button>

        <button
          className={`action-chip ${isRecording ? 'recording' : ''}`}
          onClick={onRecord}
        >
          <span className="chip-icon">
            {isRecording ? (
              <span className="recording-dot-icon" />
            ) : (
              <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
                <circle cx="7" cy="7" r="5" />
                <circle cx="7" cy="7" r="2" fill="currentColor" />
              </svg>
            )}
          </span>
          {isRecording ? t('recording') : t('record')}
        </button>
      </div>

      {showQuickActions && (
        <>
          <div className="quick-actions-overlay" onClick={() => setShowQuickActions(false)} />
          <div className="quick-actions-menu">
            {DEFAULT_QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                className="quick-action-item"
                onClick={() =>
                  handleQuickAction(
                    language === 'zh-CN' ? action.instruction : action.instructionEn
                  )
                }
              >
                {language === 'zh-CN' ? action.label : action.labelEn}
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
