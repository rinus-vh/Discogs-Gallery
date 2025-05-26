/** @typedef {import('types').VinylRecord} VinylRecord */

import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import styles from './CoverFlow.module.css'

/**
 * @param {{
 *   records: VinylRecord[],
 *   selectedRecord: VinylRecord,
 *   onSelectRecord: (r: VinylRecord) => void
 * }} props
 */
export function CoverFlow({ records, selectedRecord, onSelectRecord }) {
  const containerRef = useRef(null)
  const [perspective, setPerspective] = useState(1000)

  const selectedIndex = records.findIndex(r => r.id === selectedRecord.id)

  useEffect(() => {
    updatePerspective()
    
    function updatePerspective() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        setPerspective(width * 1.5)
      }
    }

    window.addEventListener('resize', updatePerspective)
    return () => window.removeEventListener('resize', updatePerspective)
  }, [])

  return (
    <div className={styles.container}>
      <BackgroundOverlay color='rgba(255, 255, 255, 0.05)' />
      <CoverContainer {...{ containerRef, perspective, records, selectedIndex, selectedRecord, onSelectRecord }} />
      <NavigationButtons total={records.length} {...{ handlePrevious, handleNext, selectedIndex }} />
      <CounterDisplay total={records.length} {...{ selectedIndex }} />
    </div>
  )

  function handlePrevious() {
    const prevIndex = Math.max(0, selectedIndex - 1)
    if (prevIndex !== selectedIndex) {
      onSelectRecord(records[prevIndex])
    }
  }

  function handleNext() {
    const nextIndex = Math.min(records.length - 1, selectedIndex + 1)
    if (nextIndex !== selectedIndex) {
      onSelectRecord(records[nextIndex])
    }
  }
}

/** @param {{ color: string }} props */
function BackgroundOverlay({ color }) {
  return (
    <div
      className={styles.backgroundOverlay}
      style={{ background: `radial-gradient(circle at 25% 25%, ${color} 0%, transparent 50%)` }}
    />
  )
}

/**
 * @param {{
 *   containerRef: React.RefObject<HTMLElement>,
 *   perspective: number,
 *   records: VinylRecord[],
 *   selectedIndex: number,
 *   onSelectRecord: (r: VinylRecord) => void
 * }} props
 */
function CoverContainer({ containerRef, perspective, records, selectedIndex, onSelectRecord }) {
  return (
    <div
      ref={containerRef}
      className={styles.coverContainer}
      style={{ perspective: `${perspective}px` }}
    >
      {records.map((record, index) => (
        <Cover key={record.id} {...{ record, index, selectedIndex, onSelectRecord }} />
      ))}
    </div>
  )
}

/**
 * @param {{
 *   record: VinylRecord,
 *   index: number,
 *   selectedIndex: number,
 *   onSelectRecord: (r: VinylRecord) => void
 * }} props
 */
function Cover({ record, index, selectedIndex, onSelectRecord }) {
  const placeholderText = `${record.Artist} - ${record.Title}`

  const visibleItems = 9
  const isVisiblePosition = Math.floor(visibleItems / 2)

  const position = index - selectedIndex
  const absPosition = Math.abs(position)

  if (absPosition > isVisiblePosition) return null

  const isActive = position === 0
  const direction = position < 0 ? -1 : 1
  const rotateY = isActive ? 0 : -1 * direction * (70 - (absPosition / 3) * 40)
  const scale = isActive ? 1.1 : 1 - (absPosition * 0.1)
  const translateZ = isActive ? 150 : -absPosition * 100
  const translateX = isActive ? 0 : Math.sign(position) * (90 + Math.sqrt(Math.abs(position)) * 120)
  const overlayOpacity = isActive ? 0 : Math.max(0.6, Math.min(0.7, 0.15 + absPosition * 0.25))

  const style = {
    zIndex: 100 - absPosition * 10,
    transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
  }

  const isVisible = absPosition < isVisiblePosition

  return (  
    <div
      onClick={() => isVisible && onSelectRecord(record)}
      className={cx(styles.componentCover, isVisible && styles.isVisible)}
      {...{ style }}
    >
      <div style={{ '--opacity-overlay': overlayOpacity }} className={styles.coverInner}>
        <CoverImage {...{ record, placeholderText }} />
        <ReflectionImage {...{ record, placeholderText }} />
      </div>
    </div>
  )
}

/** @param {{ record: VinylRecord, placeholderText: string }} props */
function CoverImage({ record, placeholderText }) {
  return (
    <img
      alt={placeholderText}
      src={record['Image url'] || `https://placehold.co/300x300/333/fff?text=${encodeURIComponent(placeholderText)}`}
      onError={(e) => {e.target.src = `https://placehold.co/300x300/333/fff?text=${encodeURIComponent(placeholderText)}`}}
      className={styles.componentCoverImage}
    />
  )
}

/** @param {{ record: VinylRecord, placeholderText: string }} props */
function ReflectionImage({ record, placeholderText }) {
  return (
    <div className={styles.componentReflectionWrapper}>
      <img
        alt=''
        src={record['Image url'] || `https://placehold.co/300x300/333/fff?text=${encodeURIComponent(placeholderText)}`}
        onError={(e) => {e.target.src = `https://placehold.co/300x300/333/fff?text=${encodeURIComponent(placeholderText)}`}}
        className={styles.reflectionImage}
      />
    </div>
  )
}

/**
 * @param {{
 *   handlePrevious: () => void,
 *   handleNext: () => void,
 *   selectedIndex: number,
 *   total: number
 * }} props
 */
function NavigationButtons({ handlePrevious, handleNext, selectedIndex, total }) {
  return (
    <div className={styles.componentNavigationButtons}>
      <NavigationButton onClick={handlePrevious} Icon={ChevronLeft} disabled={selectedIndex === 0} />
      <NavigationButton onClick={handleNext} Icon={ChevronRight} disabled={selectedIndex === total - 1} />
    </div>
  )
}

/**
 * @param {{
 *   onClick: () => void,
 *   disabled: boolean,
 *   Icon: React.ComponentType<{ size: number }>
 * }} props
 */
function NavigationButton({ onClick, disabled, Icon }) {
  return (
    <button className={styles.navButton} {...{ onClick, disabled }}>
      <Icon size={24} />
    </button>
  )
}

/** @param {{ selectedIndex: number, total: number }} props */
function CounterDisplay({ selectedIndex, total }) {
  return (
    <div className={styles.counter}>
      <span className={styles.counterLabel}>
        {selectedIndex + 1} / {total}
      </span>
    </div>
  )
}
