export default {
  // Header
  appName: 'Page Agent',
  settings: '设置',

  // Status
  connected: '已连接',
  disconnected: '未连接',
  idle: '空闲',
  running: '运行中',
  completed: '已完成',
  error: '错误',

  // Chat
  inputPlaceholder: '输入指令...',
  send: '发送',
  thinking: '思考中...',
  executing: '执行',
  executed: '已执行',
  retrying: '重试中',
  taskSuccess: '任务完成',
  taskFailed: '任务失败',
  stop: '停止',
  noMessages: '输入指令，开始自动化操作',

  // Quick Actions
  quickActions: '快捷指令',
  record: '录制',
  recording: '录制中...',
  stopRecording: '停止录制',

  // Settings
  settingsTitle: '设置',
  llmConfig: 'LLM 配置',
  provider: '服务商',
  baseUrl: '接口地址',
  apiKey: 'API 密钥',
  model: '模型',
  temperature: '温度',
  maxSteps: '最大步数',
  preferences: '偏好设置',
  language: '语言',
  panelPosition: '面板位置',
  left: '左',
  right: '右',
  save: '保存',
  resetDefaults: '恢复默认',
  saved: '已保存',

  // Recordings
  recordings: '录制记录',
  noRecordings: '暂无录制',
  play: '回放',
  delete: '删除',
  rename: '重命名',

  // Popup
  openPanel: '打开面板',
  quickStart: '快速开始',

  // Providers
  'provider.qwen-free': 'Qwen（免费测试）',
  'provider.openai': 'OpenAI',
  'provider.deepseek': 'DeepSeek',
  'provider.ollama': 'Ollama',
  'provider.custom': '自定义',
} as const
