import type { MessageType, Recording, RecordedAction } from '../../shared/types'
import { saveRecording } from '../../shared/storage'

// ===== Side Panel Registration =====
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error)

// ===== Message Routing =====
// Forward messages between Side Panel and Content Scripts
chrome.runtime.onMessage.addListener((msg: MessageType, sender, sendResponse) => {
  // Messages from Side Panel → forward to active tab's content script
  if (!sender.tab) {
    switch (msg.type) {
      case 'EXECUTE_TASK':
      case 'STOP_TASK':
      case 'START_RECORDING':
      case 'STOP_RECORDING':
      case 'REPLAY_RECORDING':
      case 'CONFIG_DATA':
        forwardToActiveTab(msg)
        sendResponse({ ok: true })
        return true

      case 'OPEN_SIDE_PANEL':
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.sidePanel.open({ tabId: tabs[0].id })
          }
        })
        sendResponse({ ok: true })
        return true
    }
  }

  // Messages from Content Script → only handle recording storage
  // Note: AGENT_STATUS, AGENT_ACTIVITY, AGENT_RESULT are already received
  // directly by the Side Panel via chrome.runtime.sendMessage(), so we
  // do NOT re-forward them here (that would cause duplicates).
  if (sender.tab) {
    switch (msg.type) {
      case 'RECORDING_DATA':
        handleRecordingComplete(msg.actions)
        sendResponse({ ok: true })
        return true
    }
  }

  return false
})

// ===== Helper Functions =====
function forwardToActiveTab(msg: MessageType) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id
    if (tabId) {
      chrome.tabs.sendMessage(tabId, msg).catch((err) => {
        console.warn('[Page Agent] Could not forward to tab:', err.message)
      })
    }
  })
}

async function handleRecordingComplete(actions: RecordedAction[]) {
  if (actions.length === 0) return

  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const url = tabs[0]?.url ?? ''

  const recording: Recording = {
    id: crypto.randomUUID(),
    name: `Recording ${new Date().toLocaleString()}`,
    url,
    actions,
    createdAt: Date.now(),
  }

  await saveRecording(recording)

  // Notify Side Panel about the saved recording
  chrome.runtime.sendMessage({
    type: 'RECORDING_DATA',
    actions,
  } as MessageType).catch(() => {})
}

console.log('[Page Agent] Background service worker loaded')
