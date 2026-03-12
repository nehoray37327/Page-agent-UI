import React from 'react'
import type { AgentStep as AgentStepType } from '../SidePanel'
import type { Locale } from '../../../shared/i18n'
import { useT } from '../../../shared/i18n'

interface AgentStepProps {
  step: AgentStepType
  language: Locale
}

export default function AgentStep({ step, language }: AgentStepProps) {
  const t = useT(language)

  if (step.type === 'thinking') {
    return (
      <div className="step step-thinking">
        <span className="step-icon">
          <svg className="icon-sm" viewBox="0 0 14 14" fill="currentColor">
            <circle cx="3" cy="7" r="1.2" />
            <circle cx="7" cy="7" r="1.2" />
            <circle cx="11" cy="7" r="1.2" />
          </svg>
        </span>
        <span className="step-text">{t('thinking')}</span>
      </div>
    )
  }

  if (step.type === 'executing') {
    return (
      <div className="step step-executing">
        <span className="step-icon">
          <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M4 3l-3 4 3 4M10 3l3 4-3 4" />
          </svg>
        </span>
        <span className="step-text">
          {t('executing')}: <span className="step-label">{step.tool}</span>
        </span>
      </div>
    )
  }

  if (step.type === 'executed') {
    return (
      <div className="step-wrapper">
        <div className="step step-done">
          <span className="step-icon">
            <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7.5l2.5 2.5L11 4" />
            </svg>
          </span>
          <span className="step-text">
            {step.tool}{step.duration ? ` (${step.duration}ms)` : ''}
          </span>
        </div>
        {step.output && (
          <div className="step-thought">{step.output}</div>
        )}
      </div>
    )
  }

  if (step.type === 'retrying') {
    return (
      <div className="step step-thinking">
        <span className="step-icon">
          <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M1 7a6 6 0 0 1 11-3M13 7a6 6 0 0 1-11 3" />
            <path d="M12 1v3h-3M2 13v-3h3" />
          </svg>
        </span>
        <span className="step-text">{t('retrying')}...</span>
      </div>
    )
  }

  if (step.type === 'error') {
    return (
      <div className="step step-error">
        <span className="step-icon">
          <svg className="icon-sm" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l6 6M10 4l-6 6" />
          </svg>
        </span>
        <span className="step-text">{step.message}</span>
      </div>
    )
  }

  return null
}
