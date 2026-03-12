import React from 'react'
import { createRoot } from 'react-dom/client'
import SidePanel from './SidePanel'
import './index.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')
createRoot(root).render(<SidePanel />)
