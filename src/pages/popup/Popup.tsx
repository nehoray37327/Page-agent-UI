import React, { useEffect, useState } from 'react'
import { getPreferences } from '../../shared/storage'
import { setLocale, useT, type Locale } from '../../shared/i18n'

export default function Popup() {
  const [language, setLanguage] = useState<Locale>('zh-CN')
  const t = useT(language)

  useEffect(() => {
    getPreferences().then((prefs) => {
      setLanguage(prefs.language)
      setLocale(prefs.language)
    })
  }, [])

  const openPanel = () => {
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
    window.close()
  }

  const openSettings = () => {
    chrome.runtime.openOptionsPage()
    window.close()
  }

  return (
    <div className="popup">
      <div className="popup-header">
        <div className="popup-logo">P</div>
        <span className="popup-title">Page Agent</span>
      </div>
      <div className="popup-body">
        <button className="popup-btn primary" onClick={openPanel}>
          <svg className="popup-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="1" y="2" width="14" height="12" rx="2" />
            <line x1="10" y1="2" x2="10" y2="14" />
          </svg>
          {t('openPanel')}
        </button>
        <button className="popup-btn" onClick={openSettings}>
          <svg className="popup-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="8" cy="8" r="2.5" />
            <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
          </svg>
          {t('settings')}
        </button>
      </div>
    </div>
  )
}
