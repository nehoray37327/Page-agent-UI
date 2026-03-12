import {
  LLMConfig,
  Preferences,
  Recording,
  DEFAULT_LLM_CONFIG,
  DEFAULT_PREFERENCES,
} from './types'

const KEYS = {
  llmConfig: 'pa_llm_config',
  preferences: 'pa_preferences',
  recordings: 'pa_recordings',
  quickActions: 'pa_quick_actions',
} as const

// ===== LLM Config =====
export async function getLLMConfig(): Promise<LLMConfig> {
  const result = await chrome.storage.local.get(KEYS.llmConfig)
  return result[KEYS.llmConfig] ?? { ...DEFAULT_LLM_CONFIG }
}

export async function setLLMConfig(config: LLMConfig): Promise<void> {
  await chrome.storage.local.set({ [KEYS.llmConfig]: config })
}

// ===== Preferences =====
export async function getPreferences(): Promise<Preferences> {
  const result = await chrome.storage.local.get(KEYS.preferences)
  return result[KEYS.preferences] ?? { ...DEFAULT_PREFERENCES }
}

export async function setPreferences(prefs: Preferences): Promise<void> {
  await chrome.storage.local.set({ [KEYS.preferences]: prefs })
}

// ===== Recordings =====
export async function getRecordings(): Promise<Recording[]> {
  const result = await chrome.storage.local.get(KEYS.recordings)
  return result[KEYS.recordings] ?? []
}

export async function saveRecording(recording: Recording): Promise<void> {
  const recordings = await getRecordings()
  recordings.push(recording)
  await chrome.storage.local.set({ [KEYS.recordings]: recordings })
}

export async function deleteRecording(id: string): Promise<void> {
  const recordings = await getRecordings()
  const filtered = recordings.filter((r) => r.id !== id)
  await chrome.storage.local.set({ [KEYS.recordings]: filtered })
}

export async function updateRecording(id: string, updates: Partial<Recording>): Promise<void> {
  const recordings = await getRecordings()
  const idx = recordings.findIndex((r) => r.id === id)
  if (idx !== -1) {
    recordings[idx] = { ...recordings[idx], ...updates }
    await chrome.storage.local.set({ [KEYS.recordings]: recordings })
  }
}
