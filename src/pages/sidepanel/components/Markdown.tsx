import React from 'react'

/**
 * Lightweight markdown renderer for the Side Panel.
 * Handles: headers, bold, italic, links, inline code, code blocks, lists, blockquotes.
 */
export default function Markdown({ text }: { text: string }) {
  const html = renderMarkdown(text)
  return <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderInline(text: string): string {
  return (
    text
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="md-code">$1</code>')
      // Bold + italic
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Links [text](url)
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a class="md-link" href="$2" target="_blank" rel="noopener">$1</a>'
      )
      // Auto-link bare URLs
      .replace(
        /(^|[^"'])(https?:\/\/[^\s<]+)/g,
        '$1<a class="md-link" href="$2" target="_blank" rel="noopener">$2</a>'
      )
  )
}

function renderMarkdown(text: string): string {
  const lines = text.split('\n')
  const result: string[] = []
  let inCodeBlock = false
  let codeContent: string[] = []
  let inList = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block toggle
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        result.push(`<pre class="md-pre"><code>${escapeHtml(codeContent.join('\n'))}</code></pre>`)
        codeContent = []
        inCodeBlock = false
      } else {
        if (inList) {
          result.push('</ul>')
          inList = false
        }
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeContent.push(line)
      continue
    }

    const trimmed = line.trim()

    // Empty line
    if (!trimmed) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      continue
    }

    // Headers
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)/)
    if (headerMatch) {
      if (inList) { result.push('</ul>'); inList = false }
      const level = headerMatch[1].length
      result.push(`<h${level} class="md-h">${renderInline(escapeHtml(headerMatch[2]))}</h${level}>`)
      continue
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (inList) { result.push('</ul>'); inList = false }
      result.push(`<blockquote class="md-quote">${renderInline(escapeHtml(trimmed.slice(2)))}</blockquote>`)
      continue
    }

    // Unordered list
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)/)
    if (ulMatch) {
      if (!inList) {
        result.push('<ul class="md-list">')
        inList = true
      }
      result.push(`<li>${renderInline(escapeHtml(ulMatch[1]))}</li>`)
      continue
    }

    // Ordered list
    const olMatch = trimmed.match(/^\d+\.\s+(.+)/)
    if (olMatch) {
      if (!inList) {
        result.push('<ul class="md-list md-ol">')
        inList = true
      }
      result.push(`<li>${renderInline(escapeHtml(olMatch[1]))}</li>`)
      continue
    }

    // Horizontal rule
    if (/^[-*_]{3,}$/.test(trimmed)) {
      if (inList) { result.push('</ul>'); inList = false }
      result.push('<hr class="md-hr"/>')
      continue
    }

    // Normal paragraph
    if (inList) { result.push('</ul>'); inList = false }
    result.push(`<p class="md-p">${renderInline(escapeHtml(trimmed))}</p>`)
  }

  if (inList) result.push('</ul>')
  if (inCodeBlock) {
    result.push(`<pre class="md-pre"><code>${escapeHtml(codeContent.join('\n'))}</code></pre>`)
  }

  return result.join('')
}
