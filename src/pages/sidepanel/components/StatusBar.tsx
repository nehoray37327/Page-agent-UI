import React from 'react'
import { t } from '../../../shared/i18n'

interface StatusBarProps {
  model: string
  connected: boolean
}

export default function StatusBar({ model, connected }: StatusBarProps) {
  return (
    <div className="status-bar">
      <span>{model}</span>
      <div className={`status-dot ${connected ? 'connected' : ''}`} />
      <span>{connected ? t('connected') : t('disconnected')}</span>
    </div>
  )
}
