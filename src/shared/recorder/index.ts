import type { RecordedAction } from '../types'

let isRecording = false
let actions: RecordedAction[] = []
let startTime = 0

function generateSelector(el: Element): string {
  if (el.id) return `#${el.id}`

  const tag = el.tagName.toLowerCase()

  // Try aria-label
  const ariaLabel = el.getAttribute('aria-label')
  if (ariaLabel) return `${tag}[aria-label="${ariaLabel}"]`

  // Try name attribute
  const name = el.getAttribute('name')
  if (name) return `${tag}[name="${name}"]`

  // Try type + placeholder for inputs
  if (tag === 'input') {
    const type = el.getAttribute('type') || 'text'
    const placeholder = el.getAttribute('placeholder')
    if (placeholder) return `input[type="${type}"][placeholder="${placeholder}"]`
  }

  // Try text content for buttons/links
  if (['button', 'a'].includes(tag)) {
    const text = el.textContent?.trim().slice(0, 30)
    if (text) return `${tag}:has-text("${text}")`
  }

  // Fallback: nth-child path
  const parts: string[] = []
  let current: Element | null = el
  while (current && current !== document.body) {
    const parent: Element | null = current.parentElement
    if (!parent) break
    const cur = current
    const siblings = Array.from(parent.children).filter(
      (c: Element) => c.tagName === cur.tagName
    )
    const index = siblings.indexOf(current) + 1
    parts.unshift(`${current.tagName.toLowerCase()}:nth-of-type(${index})`)
    current = parent
  }
  return parts.join(' > ')
}

function describeAction(type: string, el: Element, value?: string): string {
  const tag = el.tagName.toLowerCase()
  const text = el.textContent?.trim().slice(0, 30) ?? ''
  const label =
    el.getAttribute('aria-label') ||
    el.getAttribute('placeholder') ||
    el.getAttribute('name') ||
    text

  switch (type) {
    case 'click':
      return `Click "${label}" (${tag})`
    case 'input':
      return `Type "${value?.slice(0, 20)}" into "${label}"`
    case 'select':
      return `Select "${value}" in "${label}"`
    case 'scroll':
      return `Scroll page`
    default:
      return `${type} on ${tag}`
  }
}

function handleClick(e: MouseEvent) {
  if (!isRecording) return
  const el = e.target as Element
  if (!el) return
  actions.push({
    type: 'click',
    selector: generateSelector(el),
    timestamp: Date.now() - startTime,
    description: describeAction('click', el),
  })
}

function handleInput(e: Event) {
  if (!isRecording) return
  const el = e.target as HTMLInputElement
  if (!el) return
  actions.push({
    type: 'input',
    selector: generateSelector(el),
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
    value: el.value,
    timestamp: Date.now() - startTime,
    description: describeAction('select', el, el.value),
  })
}

export function startRecording() {
  isRecording = true
  actions = []
  startTime = Date.now()
  document.addEventListener('click', handleClick, true)
  document.addEventListener('input', handleInput, true)
  document.addEventListener('change', handleChange, true)
}

export function stopRecording(): RecordedAction[] {
  isRecording = false
  document.removeEventListener('click', handleClick, true)
  document.removeEventListener('input', handleInput, true)
  document.removeEventListener('change', handleChange, true)
  return [...actions]
}

export function getRecordingStatus(): boolean {
  return isRecording
}
