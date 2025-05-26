import React from 'react'
import { createRoot } from 'react-dom/client'
import classNames from 'classnames'

import App from './App'

import './reset.css'
import './index.css'

globalThis.cx = classNames

const container = document.getElementById('root')

if (container) {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}