import type { RecordedAction } from '../types'

let isRecording = false
let actions: RecordedAction[] = []
let startTime = 0

/**
 * Generate a human-readable description of an element.
 * This description is used by the AI agent to re-find the element during replay,
 * so it should be semantic and resilient to DOM changes.
 */
function describeElement(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const parts: string[] = []

  // Role or tag
  const role = el.getAttribute('role')
  if (role) parts.push(`[role="${role}"]`)

  // Aria label
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) parts.push(`aria-label="${ariaLabel}"`)

  // Text content (most important for AI matching)
  const text = el.textContent?.trim().slice(0, 60)
  if (text) parts.push(`text="${text}"`)

  // Name attribute
  const name = el.getAttribute('name')
  if (name) parts.push(`name="${name}"`)

  // Placeholder
  const placeholder = el.getAttribute('placeholder')
  if (placeholder) parts.push(`placeholder="${placeholder}"`)

  // Type for inputs
  if (tag === 'input') {
    const type = el.getAttribute('type') || 'text'
    parts.push(`type="${type}"`)
  }

  // ID if present
  if (el.id) parts.push(`id="${el.id}"`)

  // Class names (first 2)
  const classes = Array.from(el.classList).slice(0, 2).join(' ')
  if (classes) parts.push(`class="${classes}"`)

  const descriptor = parts.length > 0 ? parts.join(', ') : tag
  return `<${tag}> ${descriptor}`
}

/**
 * Generate a simple, valid CSS selector for an element (best-effort).
 * Used as a fallback hint, NOT the primary matching strategy.
 */
function generateSelector(el: Element): string {
  if (el.id) return `#${el.id}`

  const tag = el.tagName.toLowerCase()

  // aria-label
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return `${tag}[aria-label="${CSS.escape(ariaLabel)}"]`

  // name
  const name = el.getAttribute('name')
  if (name) return `${tag}[name="${CSS.escape(name)}"]`

  // input with type + placeholder
  if (tag === 'input') {
    const type = el.getAttribute('type') || 'text'
    const placeholder = el.getAttribute('placeholder')
    if (placeholder) return `input[type="${type}"][placeholder="${CSS.escape(placeholder)}"]`
    return `input[type="${type}"]`
  }

  // nth-of-type path (fallback)
  const parts: string[] = []
  let current: Element | null = el
  while (current && current !== document.body) {
    const parent: Element | null = current.parentElement
    if (!parent) break
    const cur = current
    const siblings = Array.from(parent.children).filter(
      (c: Element) => c.tagName === cur.tagName
    )
    if (siblings.length === 1) {
      parts.unshift(cur.tagName.toLowerCase())
    } else {
      const index = siblings.indexOf(cur) + 1
      parts.unshift(`${cur.tagName.toLowerCase()}:nth-of-type(${index})`)
    }
    current = parent
    if (parts.length >= 4) break // limit depth
  }
  return parts.join(' > ')
}

function describeAction(type: string, el: Element, value?: string): string {
  const text = el.textContent?.trim().slice(0, 40) ?? ''
  const label =
    el.getAttribute('aria-label') ||
    el.getAttribute('placeholder') ||
    el.getAttribute('name') ||
    el.getAttribute('title') ||
    text

  switch (type) {
    case 'click':
      return `Click "${label}"`
    case 'input':
      return `Type "${value?.slice(0, 20) ?? ''}" into "${label}"`
    case 'select':
      return `Select "${value}" in "${label}"`
    case 'scroll':
      return `Scroll "${label}"`
    default:
      return `${type} on "${label}"`
  }
}

function handleClick(e: MouseEvent) {
  if (!isRecording) return
  const el = e.target as Element
  if (!el) return
  actions.push({
    type: 'click',
    selector: generateSelector(el),
    elementDescription: describeElement(el),
    timestamp: Date.now() - startTime,
    description: describeAction('click', el),
  })
}

function handleInput(e: Event) {
  if (!isRecording) return
  const el = e.target as HTMLInputElement
  if (!el) return
  // Debounce: update last action if same element
  const last = actions[actions.length - 1]
  if (last && last.type === 'input' && last.selector === generateSelector(el)) {
    last.value = el.value
    last.description = describeAction('input', el, el.value)
    return
  }
  actions.push({
    type: 'input',
    selector: generateSelector(el),
    elementDescription: describeElement(el),
    value: el.value,
    timestamp: Date.now() - startTime,
    description: describeAction('input', el, el.value),
  })
}

function handleChange(e: Event) {
  if (!isRecording) return
  const el = e.target as HTMLSelectElement
  if (el.tagName !== 'SELECT') return
  actions.push({
    type: 'select',
    selector: generateSelector(el),
    elementDescription: describeElement(el),
    value: el.value,
    timestamp: Date.now() - startTime,
    description: describeAction('select', el, el.value),
  })
}

function handleScroll(e: Event) {
  if (!isRecording) return
  const target = e.target as HTMLElement | Document
  const el = (target === document ? document.documentElement : target) as Element
  if (!el) return

  // Debounce scroll events
  const last = actions[actions.length - 1]
  if (last && last.type === 'scroll' && last.selector === generateSelector(el)) {
    last.timestamp = Date.now() - startTime
    return
  }
  
  actions.push({
    type: 'scroll',
    selector: generateSelector(el),
    elementDescription: describeElement(el),
    timestamp: Date.now() - startTime,
    description: describeAction('scroll', el),
  })
}

export function startRecording() {
  isRecording = true
  actions = []
  startTime = Date.now()
  document.addEventListener('click', handleClick, true)
  document.addEventListener('input', handleInput, true)
  document.addEventListener('change', handleChange, true)
  document.addEventListener('scroll', handleScroll, true)
}

export function stopRecording(): RecordedAction[] {
  isRecording = false
  document.removeEventListener('click', handleClick, true)
  document.removeEventListener('input', handleInput, true)
  document.removeEventListener('change', handleChange, true)
  document.removeEventListener('scroll', handleScroll, true)
  return [...actions]
}

export function getRecordingStatus(): boolean {
  return isRecording
}
