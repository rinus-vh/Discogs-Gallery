/** @typedef {import('types').VinylRecord} VinylRecord */

import { X } from 'lucide-react'
import { RangeSlider } from './RangeSlider'

import styles from './FilterDrawer.module.css'

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   yearRange: [number, number],
 *   selectedYearRange: [number, number],
 *   setSelectedYearRange: (range: [number, number]) => void,
 *   allGenres: string[],
 *   selectedGenres: string[],
 *   setSelectedGenres: (genres: string[]) => void,
 *   records: VinylRecord[]
 * }} props
 */
export function FilterDrawer({
  isOpen,
  onClose,
  yearRange,
  selectedYearRange,
  setSelectedYearRange,
  allGenres,
  selectedGenres,
  setSelectedGenres,
  records
}) {
  return (
    <>
      <Overlay {...{ isOpen, onClose }} />

      <DrawerPanel {...{ isOpen }}>
        <DrawerHeader {...{ onClose }} />

        <DrawerContent
          {...{
            yearRange,
            selectedYearRange,
            setSelectedYearRange,
            allGenres,
            selectedGenres,
            setSelectedGenres,
            records
          }}
        />
      </DrawerPanel>
    </>
  )
}

/** @param {{ isOpen: boolean, onClose: () => void }} props */
function Overlay({ isOpen, onClose }) {
  return <div onClick={onClose} className={cx(styles.componentOverlay, isOpen && styles.isOpen)} />
}

/** @param {{ isOpen: boolean, children: React.ReactNode }} props */
function DrawerPanel({ isOpen, children }) {
  return <div className={cx(styles.componentDrawerPanel, isOpen && styles.isOpen)}>{children}</div>
}

/** @param {{ onClose: () => void }} props */
function DrawerHeader({ onClose }) {
  return (
    <div className={styles.componentDrawerHeader}>
      <h2 className={styles.title}>Collection Filters</h2>
      <button onClick={onClose} className={styles.closeButton}>
        <X size={20} />
      </button>
    </div>
  )
}

/**
 * @param {{
 *   yearRange: [number, number],
 *   selectedYearRange: [number, number],
 *   setSelectedYearRange: (range: [number, number]) => void,
 *   allGenres: string[],
 *   selectedGenres: string[],
 *   setSelectedGenres: (genres: string[]) => void,
 *   records: VinylRecord[]
 * }} props
 */
function DrawerContent({
  yearRange,
  selectedYearRange,
  setSelectedYearRange,
  allGenres,
  selectedGenres,
  setSelectedGenres,
  records
}) {
  return (
    <div className={styles.componentDrawerContent}>
      <div>
        <FilterGroupTitle title='Years' />
        <RangeSlider {...{ yearRange, selectedYearRange, setSelectedYearRange, records }} />
      </div>

      <div className={styles.filterGroupContainer}>
        <FilterGroupTitle title='Genres' />
        <GenreCheckboxList {...{ allGenres, selectedGenres, setSelectedGenres }} />
      </div>
    </div>
  )
}

function FilterGroupTitle({ title }) {
  return <h3 className={styles.componentFilterGroupTitle}>{title}</h3>
}

/**
 * @param {{
 *   allGenres: string[],
 *   selectedGenres: string[],
 *   setSelectedGenres: (genres: string[]) => void
 * }} props
 */
function GenreCheckboxList({ allGenres, selectedGenres, setSelectedGenres }) {
  return (
    <ul className={styles.genreList}>
      {allGenres.map((genre, i) => (
        <Checkbox
          key={`${i}-${genre}`}
          label={genre}
          isChecked={selectedGenres.includes(genre)}
          onChange={(e) => {
              if (e.target.checked) {
                setSelectedGenres([...selectedGenres, genre])
              } else {
                setSelectedGenres(selectedGenres.filter((g) => g !== genre))
              }
            }}
        />
      ))}
    </ul>
  )
}

/** @param {{ label: string, isChecked: boolean, onChange: () => void }} props */
function Checkbox({ label, isChecked, onChange }) {  
    return (
      <li className={cx(styles.componentCheckbox, isChecked && styles.isChecked)}>
        <label htmlFor={label} className={styles.checkboxLabel}>
          {label}
        </label>

        <input
          type="checkbox"
          id={label}
          checked={isChecked}
          className={cx(styles.checkboxInput, isChecked && styles.isChecked)}
          {...{ onChange }}
        />
      </li>
    )
}
