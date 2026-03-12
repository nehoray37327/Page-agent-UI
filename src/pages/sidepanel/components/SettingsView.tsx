import React, { useState, useEffect, useCallback } from 'react'
import {
  getLLMConfig,
  setLLMConfig,
  getPreferences,
  setPreferences,
  getRecordings,
  deleteRecording,
  updateRecording,
} from '../../../shared/storage'
import {
  type LLMConfig,
  type Preferences,
  type Recording,
  PROVIDER_PRESETS,
  DEFAULT_LLM_CONFIG,
  DEFAULT_PREFERENCES,
} from '../../../shared/types'
import { setLocale, useT, type Locale } from '../../../shared/i18n'

interface SettingsViewProps {
  language: Locale
  onBack: () => void
  onLanguageChange: (locale: Locale) => void
  onConfigChange: (config: LLMConfig) => void
}

export default function SettingsView({
  language,
  onBack,
  onLanguageChange,
  onConfigChange,
}: SettingsViewProps) {
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_LLM_CONFIG)
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [saved, setSaved] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const t = useT(language)

  useEffect(() => {
    async function load() {
      const c = await getLLMConfig()
      const p = await getPreferences()
      const r = await getRecordings()
      setConfig(c)
      setPrefs(p)
      setRecordings(r)
    }
    load()
  }, [])

  const handleProviderChange = useCallback(
    (provider: LLMConfig['provider']) => {
      const preset = PROVIDER_PRESETS[provider] ?? {}
      setConfig((prev) => ({
        ...prev,
        provider,
        ...preset,
      }))
    },
    []
  )

  const handleSave = useCallback(async () => {
    await setLLMConfig(config)
    await setPreferences(prefs)
    setLocale(prefs.language)
    onLanguageChange(prefs.language)
    onConfigChange(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [config, prefs, onLanguageChange, onConfigChange])

  const handleReset = useCallback(() => {
    setConfig({ ...DEFAULT_LLM_CONFIG })
    setPrefs({ ...DEFAULT_PREFERENCES })
  }, [])

  const handleDeleteRecording = useCallback(async (id: string) => {
    await deleteRecording(id)
    setRecordings((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const handleReplay = useCallback((recording: Recording) => {
    chrome.runtime.sendMessage({ type: 'REPLAY_RECORDING', recording })
    onBack()
  }, [onBack])

  const handleStartRename = useCallback((rec: Recording) => {
    setEditingId(rec.id)
    setEditName(rec.name)
  }, [])

  const handleFinishRename = useCallback(async (id: string) => {
    const trimmed = editName.trim()
    if (trimmed) {
      await updateRecording(id, { name: trimmed })
      setRecordings((prev) =>
        prev.map((r) => (r.id === id ? { ...r, name: trimmed } : r))
      )
    }
    setEditingId(null)
  }, [editName])

  return (
    <div className="settings-view">
      {/* Settings Header */}
      <div className="settings-header">
        <button className="settings-back-btn" onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M8.5 3L4.5 7l4 4" />
          </svg>
        </button>
        <span className="settings-title">{t('settingsTitle')}</span>
      </div>

      <div className="settings-body">
        {/* LLM Config */}
        <div className="settings-section">
          <h3 className="section-title">{t('llmConfig')}</h3>

          <label className="field-label">{t('provider')}</label>
          <select
            className="s-select"
            value={config.provider}
            onChange={(e) => handleProviderChange(e.target.value as LLMConfig['provider'])}
          >
            {Object.keys(PROVIDER_PRESETS).map((key) => (
              <option key={key} value={key}>
                {t(`provider.${key}` as any)}
              </option>
            ))}
          </select>

          <label className="field-label">{t('baseUrl')}</label>
          <input
            className="s-input"
            type="text"
            value={config.baseURL}
            onChange={(e) => setConfig((p) => ({ ...p, baseURL: e.target.value }))}
          />

          <label className="field-label">{t('apiKey')}</label>
          <div className="s-input-group">
            <input
              className="s-input"
              type={showApiKey ? 'text' : 'password'}
              value={config.apiKey}
              onChange={(e) => setConfig((p) => ({ ...p, apiKey: e.target.value }))}
            />
            <button className="s-eye-btn" onClick={() => setShowApiKey(!showApiKey)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2">
                {showApiKey ? (
                  <>
                    <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
                    <circle cx="7" cy="7" r="2" />
                  </>
                ) : (
                  <>
                    <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" />
                    <line x1="2" y1="2" x2="12" y2="12" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <label className="field-label">{t('model')}</label>
          <input
            className="s-input"
            type="text"
            value={config.model}
            onChange={(e) => setConfig((p) => ({ ...p, model: e.target.value }))}
          />
        </div>

        {/* Preferences */}
        <div className="settings-section">
          <h3 className="section-title">{t('preferences')}</h3>

          <label className="field-label">{t('language')}</label>
          <div className="s-toggle-group">
            <button
              className={`s-toggle ${prefs.language === 'zh-CN' ? 'active' : ''}`}
              onClick={() => {
                const newPrefs = { ...prefs, language: 'zh-CN' as const }
                setPrefs(newPrefs)
                setLocale('zh-CN')
                onLanguageChange('zh-CN')
                setPreferences(newPrefs)
              }}
            >
              中文
            </button>
            <button
              className={`s-toggle ${prefs.language === 'en-US' ? 'active' : ''}`}
              onClick={() => {
                const newPrefs = { ...prefs, language: 'en-US' as const }
                setPrefs(newPrefs)
                setLocale('en-US')
                onLanguageChange('en-US')
                setPreferences(newPrefs)
              }}
            >
              EN
            </button>
          </div>

          <label className="field-label">{t('temperature')}</label>
          <div className="s-slider-row">
            <input
              type="range"
              className="s-slider"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature ?? 0.5}
              onChange={(e) =>
                setConfig((p) => ({ ...p, temperature: parseFloat(e.target.value) }))
              }
            />
            <span className="s-slider-val">{config.temperature ?? 0.5}</span>
          </div>

          <label className="field-label">{t('maxSteps')}</label>
          <input
            className="s-input s-input-sm"
            type="number"
            min="1"
            max="100"
            value={config.maxSteps ?? 40}
            onChange={(e) =>
              setConfig((p) => ({ ...p, maxSteps: parseInt(e.target.value) || 40 }))
            }
          />
        </div>

        {/* Recordings */}
        <div className="settings-section">
          <h3 className="section-title">{t('recordings')}</h3>
          {recordings.length === 0 ? (
            <p className="s-empty">{t('noRecordings')}</p>
          ) : (
            <div className="s-recordings">
              {recordings.map((rec) => (
                <div key={rec.id} className="s-rec-item">
                  <div className="s-rec-info">
                    {editingId === rec.id ? (
                      <input
                        className="s-input s-rec-rename"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleFinishRename(rec.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleFinishRename(rec.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        autoFocus
                      />
                    ) : (
                      <span
                        className="s-rec-name"
                        onDoubleClick={() => handleStartRename(rec)}
                        title={t('doubleClickRename') || 'Double-click to rename'}
                      >
                        {rec.name}
                      </span>
                    )}
                    <span className="s-rec-meta">{rec.actions.length} steps</span>
                  </div>
                  <div className="s-rec-actions">
                    <button className="s-rec-btn" onClick={() => handleReplay(rec)} title={t('play')}>
                      <svg viewBox="0 0 14 14" fill="currentColor" width="11" height="11">
                        <path d="M4 2.5v9l7-4.5z" />
                      </svg>
                    </button>
                    <button className="s-rec-btn" onClick={() => handleStartRename(rec)} title={t('rename') || 'Rename'}>
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" width="11" height="11">
                        <path d="M8 2.5l3.5 3.5M2 12l.5-2L9.5 3l2 2-7 7-2.5.5z" />
                      </svg>
                    </button>
                    <button className="s-rec-btn s-rec-del" onClick={() => handleDeleteRecording(rec.id)} title={t('delete')}>
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" width="11" height="11">
                        <path d="M4 4l6 6M10 4l-6 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="settings-footer">
        <button className="s-save-btn" onClick={handleSave}>
          {saved ? t('saved') : t('save')}
        </button>
        <button className="s-reset-btn" onClick={handleReset}>
          {t('resetDefaults')}
        </button>
      </div>
    </div>
  )
}
