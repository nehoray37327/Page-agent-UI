import React from 'react'

interface HeaderProps {
  onSettings: () => void
}

export default function Header({ onSettings }: HeaderProps) {
  return (
    <div className="header">
      <div className="header-left">
        <div className="header-logo">P</div>
        <span className="header-title">Page Agent</span>
      </div>
      <button className="header-btn" onClick={onSettings} title="Settings">
        <svg className="icon-md" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
          <circle cx="8" cy="8" r="2.5" />
          <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06" />
        </svg>
      </button>
    </div>
  )
}
