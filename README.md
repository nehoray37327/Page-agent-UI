# Page Agent UI

`Page Agent UI` 是一个基于浏览器侧边栏的网页自动化扩展界面。用户可以在当前页面中直接输入自然语言指令，由 AI Agent 结合页面上下文完成点击、输入、滚动、读取页面等操作。

## 核心能力

- 在 Side Panel 中输入自然语言任务，并在当前网页执行自动化操作
- 实时展示 Agent 状态、执行步骤和最终结果
- 支持快捷指令，常用任务可以一键发送
- 支持页面操作录制，并将录制结果保存到本地
- 支持回放录制任务，回放时会转成自然语言步骤再交给 Agent 执行
- 支持中英文界面切换
- 支持多种模型提供方预设：`Qwen`、`OpenAI`、`DeepSeek`、`Ollama`、`Custom`

## 适用场景

- 自动填写网页表单
- 按自然语言执行网页流程
- 阅读并总结当前页面内容
- 录制一段网页操作，后续重复回放
- 为内部工具或垂直业务封装专用网页 Agent 扩展

## 技术栈

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Chrome Extension Manifest V3
- `webextension-polyfill`
- `page-agent`

## 项目结构

```text
src/
  pages/
    background/   后台服务，负责转发消息与 side panel 打开逻辑
    content/      内容脚本，负责初始化 Agent 并在页面执行任务
    popup/        扩展图标弹窗
    sidepanel/    主交互界面，聊天、状态、快捷指令、设置入口
    options/      独立设置页，管理模型配置和录制记录
  shared/
    i18n/         中英文文案
    recorder/     用户操作录制逻辑
    storage.ts    本地配置、快捷指令、录制记录存储
    types/        共享类型定义
public/
  图标与注入样式
```

## 工作方式

1. 用户点击扩展图标，在弹窗中打开 Side Panel。
2. Side Panel 发送任务给后台脚本。
3. 后台脚本将任务转发给当前激活标签页的内容脚本。
4. 内容脚本初始化 `PageAgentCore` 和 `PageController`，在页面中执行操作。
5. 执行中的状态、步骤和结果实时回传到 Side Panel。

录制模式下，扩展会监听点击、输入、下拉选择和滚动等行为，并将这些行为保存为结构化步骤。回放时，系统会把这些步骤转换成自然语言指令，再让 Agent 执行，从而提升对页面变化的适应性。

## 快速开始

### 环境要求

- Node.js `18.17.1` 或更高
- npm 或 yarn
- 推荐使用 Chromium 浏览器进行开发和验证

### 安装依赖

```bash
npm install
```

或

```bash
yarn
```

### 本地开发

默认开发目标为 Chrome：

```bash
npm run dev
```

也可以显式指定浏览器：

```bash
npm run dev:chrome
npm run dev:firefox
```

开发模式会持续监听文件变化，并刷新对应的构建产物目录。

### 生产构建

```bash
npm run build
```

或按浏览器分别构建：

```bash
npm run build:chrome
npm run build:firefox
```

构建产物默认输出到：

- `dist_chrome/`
- `dist_firefox/`

## 加载扩展

### Chrome / Edge / Arc 等 Chromium 浏览器

1. 打开 `chrome://extensions`
2. 打开开发者模式
3. 选择“加载已解压的扩展程序”
4. 选择仓库中的 `dist_chrome` 目录

### Firefox

1. 打开 `about:debugging#/runtime/this-firefox`
2. 选择“临时载入附加组件”
3. 选择 `dist_firefox/manifest.json`

说明：仓库保留了 Firefox 构建配置，但当前产品交互以 Chromium Side Panel 体验为主。若用于 Firefox，请结合目标版本自行验证侧边栏相关能力。

## 首次配置

扩展安装后，先在设置页中完成模型配置：

- `Provider`：选择内置预设或自定义服务商
- `Base URL`：模型服务地址
- `API Key`：模型密钥
- `Model`：模型名称
- `Temperature`：生成温度
- `Max Steps`：单次任务的最大执行步数

当前内置预设包括：

- `qwen-free`
- `openai`
- `deepseek`
- `ollama`
- `custom`

所有配置都保存在浏览器 `chrome.storage.local` 中。

## 使用说明

### 通过自然语言执行任务

在 Side Panel 中输入类似下面的指令：

- `自动填写页面上的表单`
- `阅读当前页面并总结重点`
- `找到提交按钮并点击`
- `滚动到页面底部`

### 使用快捷指令

扩展内置了几组快捷操作，也支持在设置页中自行新增、编辑和删除快捷指令。

### 录制与回放

1. 在 Side Panel 中点击录制按钮
2. 在页面上完成一组操作
3. 停止录制后，记录会保存到本地
4. 在设置页中可重命名、删除或回放该记录

## 权限说明

当前扩展使用的主要权限：

- `activeTab`：与当前活动标签页通信
- `sidePanel`：打开浏览器侧边栏
- `storage`：保存模型配置、偏好设置、快捷指令和录制记录
- `content_scripts` 注入到网页：用于读取页面上下文并执行自动化操作

## 开发说明

### 主要页面入口

- `src/pages/popup/index.tsx`
- `src/pages/sidepanel/index.tsx`
- `src/pages/options/index.tsx`
- `src/pages/content/index.tsx`
- `src/pages/background/index.ts`

### 数据存储

本地存储键定义在 `src/shared/storage.ts`：

- `pa_llm_config`
- `pa_preferences`
- `pa_recordings`
- `pa_quick_actions`

### 国际化

当前仓库内置两种语言：

- `zh-CN`
- `en-US`

对应文案位于：

- `src/shared/i18n/zh-CN.ts`
- `src/shared/i18n/en-US.ts`

## 当前实现特点

- UI 入口完整：Popup、Side Panel、Options、Background、Content Script 都已接通
- 执行链路清晰：Side Panel -> Background -> Content Script -> Agent
- 录制回放不是硬编码 DOM 脚本重放，而是先转为自然语言步骤再执行
- 模型接入方式灵活，适合接第三方兼容 OpenAI 协议的服务

## 注意事项

- `API Key` 当前保存在浏览器本地存储中，适合开发和个人使用场景；如果用于生产级分发，建议补充更严格的密钥管理策略
- 内容脚本会注入网页环境，自动化能力依赖目标站点 DOM 结构、权限策略和 CSP 情况
- 当前默认配置里带有测试型 Provider 预设，正式使用前建议替换为你自己的服务地址和模型配置

## License

[MIT](./LICENSE)
