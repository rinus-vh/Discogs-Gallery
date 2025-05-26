import { useState } from 'react'
import { ChevronRight, Maximize, Minimize } from 'lucide-react'

import { useAppContext } from '../context/AppContext'

import { Modal } from './Modal'
import { ButtonGray, ButtonRed, ButtonTransparent } from './Button'

import styles from './BreadcrumbMenu.module.css'

export function BreadcrumbMenu() {
  const {
    page,
    setPage,
    hasViewedCollection,
    showHomeModal,
    setShowHomeModal,
    setRecords,
    setDiscogsFile,
    setDiscogsToken,
    setHasViewedCollection
  } = useAppContext()

  const [isFullscreen, setIsFullscreen] = useState(false)

  if (page === 'home') return null

  return (
    <>
      <div className={styles.component}>
        <BreadcrumbTrail
          page={page}
          hasViewedCollection={hasViewedCollection}
          onHomeClick={handleHomeClick}
          onPageChange={setPage}
        />

        <FullscreenToggle {...{ isFullscreen, toggleFullscreen }} />
      </div>

      <HomeModalConfirm
        isOpen={showHomeModal}
        onClose={() => setShowHomeModal(false)}
        onConfirm={handleConfirmHome}
      />
    </>
  )

    function handleHomeClick() {
    setShowHomeModal(true)
  }

  function handleConfirmHome() {
    setRecords([])
    setDiscogsFile(null)
    setDiscogsToken('')
    setHasViewedCollection(false)
    setPage('home')
    setShowHomeModal(false)
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }
}

/**
 * @param {{
 *   page: string,
 *   hasViewedCollection: boolean,
 *   onHomeClick: () => void,
 *   onPageChange: (page: string) => void
 * }} props
 */
function BreadcrumbTrail({ page, hasViewedCollection, onHomeClick, onPageChange }) {
  return (
    <div className={styles.componentBreadcrumbTrail}>
      <BreadcrumbItem
        label="Home"
        isActive={false}
        isPast={true}
        isEnabled={true}
        onClick={onHomeClick}
      />
      
      <ChevronRight size={14} className={styles.iconChevronRight1} />

      <BreadcrumbItem
        label="Process Collection"
        isActive={page === 'input'}
        isPast={page === 'edit' || hasViewedCollection}
        isEnabled={true}
        onClick={() => onPageChange('input')}
      />

      <ChevronRight size={12} className={styles.iconChevronRight2} />

      <BreadcrumbItem
        label="Collection Gallery"
        isActive={page === 'edit'}
        isPast={hasViewedCollection}
        isEnabled={hasViewedCollection}
        onClick={() => hasViewedCollection && onPageChange('edit')}
      />
    </div>
  )
}

/**
 * @param {{
 *   label: string,
 *   isActive: boolean,
 *   isPast: boolean,
 *   isEnabled: boolean,
 *   onClick: () => void,
 * }} props
 */
function BreadcrumbItem({ label, isActive, isPast, isEnabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!isEnabled}
      className={cx(
        styles.componentBreadcrumbItem,
        isActive && styles.isActive,
        !isActive && isPast && styles.isPast,
        !isActive && !isPast && styles.isFuture,
        isEnabled && styles.isEnabled
      )}
    >
      {label}
    </button>
  )
}

/**
 * @param {{ isFullscreen: boolean, toggleFullscreen: () => void }} props
 */
function FullscreenToggle({ isFullscreen, toggleFullscreen }) {
  return (
    <ButtonTransparent
      onClick={toggleFullscreen}
      Icon={isFullscreen ? Minimize : Maximize}
      size='sm'
    />
  )
}

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   onConfirm: () => void
 * }} props
 */
function HomeModalConfirm({ isOpen, onClose, onConfirm }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return to Home">
      <p className={styles.modalParagraph}>
        Are you sure you want to return to the home page? Any unsaved changes to your collection will be permanently lost.
      </p>

      <div className={styles.modalButtonsContainer}>
        <ButtonGray onClick={onClose} label='Cancel' />
        <ButtonRed onClick={onConfirm} label='Continue' />
      </div>
    </Modal>
  )
}
