export default {
  // Header
  appName: 'Page Agent',
  settings: 'Settings',

  // Status
  connected: 'Connected',
  disconnected: 'Disconnected',
  idle: 'Idle',
  running: 'Running',
  completed: 'Completed',
  error: 'Error',

  // Chat
  inputPlaceholder: 'Enter instruction...',
  send: 'Send',
  thinking: 'Thinking...',
  executing: 'Executing',
  executed: 'Executed',
  retrying: 'Retrying',
  taskSuccess: 'Task completed',
  taskFailed: 'Task failed',
  stop: 'Stop',
  noMessages: 'Enter an instruction to start',

  // Quick Actions
  quickActions: 'Quick Actions',
  record: 'Record',
  recording: 'Recording...',
  stopRecording: 'Stop Recording',

  // Settings
  settingsTitle: 'Settings',
  llmConfig: 'LLM Configuration',
  provider: 'Provider',
  baseUrl: 'Base URL',
  apiKey: 'API Key',
  model: 'Model',
  temperature: 'Temperature',
  maxSteps: 'Max Steps',
  preferences: 'Preferences',
  language: 'Language',
  save: 'Save',
  resetDefaults: 'Reset to Defaults',
  saved: 'Saved',

  // Recordings
  recordings: 'Recordings',
  noRecordings: 'No recordings yet',
  play: 'Play',
  delete: 'Delete',
  rename: 'Rename',
  doubleClickRename: 'Double-click to rename',

  // Popup
  openPanel: 'Open Panel',
  quickStart: 'Quick Start',

  // Providers
  'provider.qwen-free': 'Qwen (Free Test)',
  'provider.openai': 'OpenAI',
  'provider.deepseek': 'DeepSeek',
  'provider.ollama': 'Ollama',
  'provider.custom': 'Custom',
} as const
