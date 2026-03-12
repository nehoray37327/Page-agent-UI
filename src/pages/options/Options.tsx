import React, { useState, useEffect, useCallback } from 'react'
import {
  getLLMConfig,
  setLLMConfig,
  getPreferences,
  setPreferences,
  getRecordings,
  deleteRecording,
} from '../../shared/storage'
import {
  type LLMConfig,
  type Preferences,
  type Recording,
  PROVIDER_PRESETS,
  DEFAULT_LLM_CONFIG,
  DEFAULT_PREFERENCES,
} from '../../shared/types'
import { setLocale, useT, type Locale } from '../../shared/i18n'

export default function Options() {
  const [config, setConfig] = useState<LLMConfig>(DEFAULT_LLM_CONFIG)
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES)
  const [recordings, setRecordings] = useState<Recording[]>([])
  const [saved, setSaved] = useState(false)
  const t = useT(prefs.language)

  useEffect(() => {
    async function load() {
      const c = await getLLMConfig()
      const p = await getPreferences()
      const r = await getRecordings()
      setConfig(c)
      setPrefs(p)
      setRecordings(r)
      setLocale(p.language)
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
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [config, prefs])

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
  }, [])

  return (
    <div className="options-page">
      <h1 className="options-title">Page Agent {t('settingsTitle')}</h1>

      <div className="options-grid">
        {/* LLM Config Card */}
        <div className="card">
          <h2 className="card-title">{t('llmConfig')}</h2>

          <label className="field-label">{t('provider')}</label>
          <select
            className="field-select"
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
            className="field-input"
            type="text"
            value={config.baseURL}
            onChange={(e) => setConfig((p) => ({ ...p, baseURL: e.target.value }))}
            placeholder="https://api.openai.com/v1"
          />

          <label className="field-label">{t('apiKey')}</label>
          <input
            className="field-input"
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig((p) => ({ ...p, apiKey: e.target.value }))}
            placeholder="sk-..."
          />

          <label className="field-label">{t('model')}</label>
          <input
            className="field-input"
            type="text"
            value={config.model}
            onChange={(e) => setConfig((p) => ({ ...p, model: e.target.value }))}
            placeholder="gpt-5.1"
          />
        </div>

        {/* Preferences Card */}
        <div className="card">
          <h2 className="card-title">{t('preferences')}</h2>

          <label className="field-label">{t('language')}</label>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${prefs.language === 'zh-CN' ? 'active' : ''}`}
              onClick={() => setPrefs((p) => ({ ...p, language: 'zh-CN' }))}
            >
              中文
            </button>
            <button
              className={`toggle-btn ${prefs.language === 'en-US' ? 'active' : ''}`}
              onClick={() => setPrefs((p) => ({ ...p, language: 'en-US' }))}
            >
              English
            </button>
          </div>

          <label className="field-label">{t('panelPosition')}</label>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${prefs.panelPosition === 'left' ? 'active' : ''}`}
              onClick={() => setPrefs((p) => ({ ...p, panelPosition: 'left' }))}
            >
              {t('left')}
            </button>
            <button
              className={`toggle-btn ${prefs.panelPosition === 'right' ? 'active' : ''}`}
              onClick={() => setPrefs((p) => ({ ...p, panelPosition: 'right' }))}
            >
              {t('right')}
            </button>
          </div>

          <label className="field-label">{t('temperature')}</label>
          <div className="slider-row">
            <input
              type="range"
              className="field-slider"
              min="0"
              max="1"
              step="0.1"
              value={config.temperature ?? 0.5}
              onChange={(e) =>
                setConfig((p) => ({ ...p, temperature: parseFloat(e.target.value) }))
              }
            />
            <span className="slider-value">{config.temperature ?? 0.5}</span>
          </div>

          <label className="field-label">{t('maxSteps')}</label>
          <input
            className="field-input field-input-sm"
            type="number"
            min="1"
            max="100"
            value={config.maxSteps ?? 40}
            onChange={(e) =>
              setConfig((p) => ({ ...p, maxSteps: parseInt(e.target.value) || 40 }))
            }
          />
        </div>

        {/* Recordings Card */}
        <div className="card">
          <h2 className="card-title">{t('recordings')}</h2>

          {recordings.length === 0 ? (
            <p className="empty-text">{t('noRecordings')}</p>
          ) : (
            <div className="recordings-list">
              {recordings.map((rec) => (
                <div key={rec.id} className="recording-item">
                  <div className="recording-info">
                    <span className="recording-name">{rec.name}</span>
                    <span className="recording-meta">
                      {rec.actions.length} steps
                    </span>
                  </div>
                  <div className="recording-actions">
                    <button
                      className="rec-btn"
                      onClick={() => handleReplay(rec)}
                      title={t('play')}
                    >
                      <svg viewBox="0 0 14 14" fill="currentColor" width="12" height="12">
                        <path d="M4 2.5v9l7-4.5z" />
                      </svg>
                    </button>
                    <button
                      className="rec-btn rec-btn-delete"
                      onClick={() => handleDeleteRecording(rec.id)}
                      title={t('delete')}
                    >
                      <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" width="12" height="12">
                        <path d="M3 4h8l-.7 8H3.7zM5.5 6v4M8.5 6v4M2 4h10M5 4V2.5h4V4" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="options-footer">
        <button className="save-btn" onClick={handleSave}>
          {saved ? t('saved') : t('save')}
        </button>
        <button className="reset-btn" onClick={handleReset}>
          {t('resetDefaults')}
        </button>
      </div>
    </div>
  )
}
