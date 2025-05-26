import { useEffect, useRef } from 'react'
import { useAppContext } from '../context/AppContext'

import styles from './LogViewer.module.css'

/** @typedef {import('../types').LogEntry} LogEntry */

/**
 * @param {{ maxHeight?: string }} props
 */
export function LogViewer({ maxHeight = '400px' }) {
  const { logs } = useAppContext()
  const containerRef = useRef(null)

  useScrollToBottom(containerRef, logs)

  if (logs.length === 0) return null

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ maxHeight }}
    >
      {logs.map((log, index) => (
        <LogMessage key={index} type={log.type} message={log.message} />
      ))}
    </div>
  )
}

function useScrollToBottom(ref, dependency) {
  useEffect(() => {
    const container = ref.current
    if (!container) return

    const isAtBottom =
      container.scrollHeight - container.scrollTop <= container.clientHeight + 100

    if (isAtBottom) {
      container.scrollTop = container.scrollHeight
    }
  }, [dependency])
}

/**
 * @param {{
 *   type: LogEntry['type'],
 *   message: string
 * }} props
 */
function LogMessage({ type, message }) {
  return (
    <div className={cx(styles.logMessage, styles[type] || styles.default)}>
      {message}
    </div>
  )
}