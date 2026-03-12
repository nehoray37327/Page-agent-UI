// ===== LLM Configuration =====
export interface LLMConfig {
  provider: 'qwen-free' | 'openai' | 'deepseek' | 'ollama' | 'custom'
  baseURL: string
  apiKey: string
  model: string
  temperature?: number
  maxSteps?: number
}

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'qwen-free',
  baseURL: 'https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run',
  apiKey: 'NA',
  model: 'qwen3.5-plus',
  temperature: undefined,
  maxSteps: 40,
}

export const PROVIDER_PRESETS: Record<string, Partial<LLMConfig>> = {
  'qwen-free': {
    baseURL: 'https://page-ag-testing-ohftxirgbn.cn-shanghai.fcapp.run',
    apiKey: 'NA',
    model: 'qwen3.5-plus',
  },
  openai: {
    baseURL: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-5.1',
  },
  deepseek: {
    baseURL: 'https://api.deepseek.com/v1',
    apiKey: '',
    model: 'deepseek-3.2',
  },
  ollama: {
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'NA',
    model: 'qwen3:14b',
  },
  custom: {
    baseURL: '',
    apiKey: '',
    model: '',
  },
}

// ===== Preferences =====
export interface Preferences {
  language: 'zh-CN' | 'en-US'
  panelPosition: 'left' | 'right'
}

export const DEFAULT_PREFERENCES: Preferences = {
  language: 'zh-CN',
  panelPosition: 'right',
}

// ===== Recording =====
export interface RecordedAction {
  type: 'click' | 'input' | 'select' | 'scroll'
  selector: string
  value?: string
  timestamp: number
  description: string
}

export interface Recording {
  id: string
  name: string
  url: string
  actions: RecordedAction[]
  createdAt: number
}

// ===== Messaging =====
export type MessageType =
  | { type: 'EXECUTE_TASK'; task: string }
  | { type: 'STOP_TASK' }
  | { type: 'AGENT_STATUS'; status: 'idle' | 'running' | 'completed' | 'error' }
  | { type: 'AGENT_ACTIVITY'; activity: AgentActivityData }
  | { type: 'AGENT_HISTORY'; history: HistoryItem[] }
  | { type: 'AGENT_RESULT'; success: boolean; data: string }
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'RECORDING_DATA'; actions: RecordedAction[] }
  | { type: 'REPLAY_RECORDING'; recording: Recording }
  | { type: 'GET_CONFIG' }
  | { type: 'CONFIG_DATA'; config: LLMConfig; preferences: Preferences }
  | { type: 'OPEN_SIDE_PANEL' }

export interface AgentActivityData {
  type: 'thinking' | 'executing' | 'executed' | 'retrying' | 'error'
  tool?: string
  input?: unknown
  output?: string
  duration?: number
  attempt?: number
  maxAttempts?: number
  message?: string
}

export interface HistoryItem {
  type: 'step' | 'observation' | 'user_takeover' | 'retry' | 'error'
  stepIndex?: number
  reflection?: { thought: string }
  action?: { tool: string; input: unknown }
  content?: string
  message?: string
}

// ===== Quick Actions =====
export interface QuickAction {
  id: string
  label: string
  labelEn: string
  instruction: string
  instructionEn: string
}

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'fill-form',
    label: '填写表单',
    labelEn: 'Fill Form',
    instruction: '自动填写页面上的表单',
    instructionEn: 'Auto fill the form on this page',
  },
  {
    id: 'scroll-bottom',
    label: '滚动到底部',
    labelEn: 'Scroll to Bottom',
    instruction: '滚动到页面底部',
    instructionEn: 'Scroll to the bottom of the page',
  },
  {
    id: 'click-submit',
    label: '点击提交',
    labelEn: 'Click Submit',
    instruction: '找到并点击提交按钮',
    instructionEn: 'Find and click the submit button',
  },
  {
    id: 'read-page',
    label: '阅读页面',
    labelEn: 'Read Page',
    instruction: '阅读当前页面内容并总结',
    instructionEn: 'Read the current page content and summarize',
  },
]
