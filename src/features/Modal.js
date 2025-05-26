import { X } from 'lucide-react'

import styles from './Modal.module.css'

export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className={styles.wrapper}>
      <ModalOverlay onClose={onClose} />

      <ModalContainer>
        <ModalHeader title={title} onClose={onClose} />
        <ModalBody>{children}</ModalBody>
      </ModalContainer>
    </div>
  )
}

function ModalOverlay({ onClose }) {
  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    />
  )
}

function ModalContainer({ children }) {
  return (
    <div className={styles.container}>
      {children}
    </div>
  )
}

function ModalHeader({ title, onClose }) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <button onClick={onClose} className={styles.closeButton}>
        <X size={20} />
      </button>
    </div>
  )
}

function ModalBody({ children }) {
  return <div className={styles.body}>{children}</div>
}
