import { useState } from 'react'
import { Info } from 'lucide-react'

import styles from './Tooltip.module.css'

/**
 * @param {{ text: string }} props
 */
export function Tooltip({ text }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div 
      className={styles.wrapper}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Info size={16} className={styles.icon} />
      {isOpen && (
        <div className={styles.tooltip}>
          <p className={styles.text}>{text}</p>
        </div>
      )}
    </div>
  )
}