import { useState, useCallback, useEffect, useMemo } from 'react'
import { Download, Info, Filter } from 'lucide-react'

import { useAppContext } from '../context/AppContext'
import { generateCsv, downloadCsv } from '../utils/csvHelpers'

import { ButtonOrange, ButtonTransparent } from '../features/Button'
import { CoverFlow } from '../features/CoverFlow'
import { RecordDetails } from '../features/RecordDetails'
import { CollectionList } from '../features/CollectionList'
import { FilterDrawer } from '../features/FilterDrawer'

import styles from './CollectionGallery.module.css'

export function CollectionGallery() {
  const { records, selectedRecord, setSelectedRecord } = useAppContext()

  const [filter, setFilter] = useState('')
  const [sortBy, setSortBy] = useState('artist')
  const [showFilters, setShowFilters] = useState(false)

  const [yearRange] = useState(() => {
    const years = records.map(r => r.Released || 0).filter(Boolean)
    return [Math.min(...years), Math.max(...years)]
  })

  const [selectedYearRange, setSelectedYearRange] = useState(yearRange)
  const [selectedGenres, setSelectedGenres] = useState([])

  const allGenres = useMemo(() => {
    const genres = new Set()
    records.forEach(record => {
      record.Genres.forEach(genre => genres.add(genre))
    })
    return Array.from(genres).sort()
  }, [records])

  const sortedAndFilteredRecords = useMemo(() => {
    const search = filter.toLowerCase()
    const isYearRangeAtExtreme = selectedYearRange[0] === yearRange[0] && selectedYearRange[1] === yearRange[1]

    const filtered = records.filter(record => {
      const matchesSearch =
        record.Artist.toLowerCase().includes(search) ||
        record.Title.toLowerCase().includes(search) ||
        (record.Released?.toString() || '').includes(search) ||
        record.Genres.some(genre => genre.toLowerCase().includes(search))

      const matchesYear = isYearRangeAtExtreme || 
        (record.Released && record.Released >= selectedYearRange[0] && record.Released <= selectedYearRange[1])
      
      const matchesGenre = selectedGenres.length === 0 || record.Genres.some(g => selectedGenres.includes(g))

      return matchesSearch && matchesYear && matchesGenre
    })

    return filtered.sort((a, b) => {
      if (sortBy === 'genre') {
        const genreA = a['Primary Genre'] || a.Genres?.[0] || ''
        const genreB = b['Primary Genre'] || b.Genres?.[0] || ''
        return genreA.localeCompare(genreB) || a.Artist.localeCompare(b.Artist) || (a.Released || 0) - (b.Released || 0)
      }
      if (sortBy === 'year') {
        return (a.Released || 0) - (b.Released || 0) || a.Artist.localeCompare(b.Artist)
      }
      return a.Artist.localeCompare(b.Artist) || (a.Released || 0) - (b.Released || 0)
    })
  }, [records, filter, sortBy, selectedGenres, selectedYearRange, yearRange])

  const handleKeyNavigation = useCallback((e) => {
    if (!selectedRecord) return

    const index = sortedAndFilteredRecords.findIndex(r => r.id === selectedRecord.id)
    let newIndex = index

    if (['ArrowUp', 'ArrowLeft'].includes(e.key)) {
      newIndex = Math.max(0, index - 1)
    } else if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
      newIndex = Math.min(sortedAndFilteredRecords.length - 1, index + 1)
    }

    if (newIndex !== index) {
      const next = sortedAndFilteredRecords[newIndex]
      setSelectedRecord(next)
      document.getElementById(`record-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [selectedRecord, sortedAndFilteredRecords, setSelectedRecord])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyNavigation)
    return () => window.removeEventListener('keydown', handleKeyNavigation)
  }, [handleKeyNavigation])

  const exportCollection = async () => {
    try {
      const csv = await generateCsv(records)
      downloadCsv(csv, 'sorted_vinyl_collection.csv')
    } catch (e) {
      console.error('Export failed', e)
    }
  }

  return (
    <div className={styles.page}>
      <HeaderSection onExport={exportCollection} count={sortedAndFilteredRecords.length} />
      <SearchAndFilterBar onOpenFilters={() => setShowFilters(true)} {...{ filter, setFilter }} />

      <div className={styles.main}>
        <CollectionSplitPane
          records={sortedAndFilteredRecords}
          {...{
            selectedRecord,
            setSelectedRecord,
            sortBy,
            setSortBy
          }}
        />
      </div>

      <FilterDrawer
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
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
    </div>
  )
}

function HeaderSection({ count, onExport }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <h1 className={styles.title}>Edit Collection ({count} records)</h1>

        <ButtonOrange
          onClick={onExport}
          label='Export CSV'
          Icon={Download}
        />
      </div>
    </header>
  )
}

function SearchAndFilterBar({ filter, setFilter, onOpenFilters }) {
  return (
    <div className={styles.searchBar}>
      <div className={styles.searchInputWrapper}>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search by artist, title, year, or genre..."
          className={styles.searchInput}
        />
      </div>
      
      <ButtonTransparent onClick={onOpenFilters} Icon={Filter} />
    </div>
  )
}

function CollectionSplitPane({ records, selectedRecord, setSelectedRecord, sortBy, setSortBy }) {
  return (
    <>
      <div className={styles.leftPane}>
        <CollectionListSortHeader {...{ sortBy, setSortBy }} />
        <CollectionList onSelectRecord={setSelectedRecord} {...{ records, selectedRecord }} />
      </div>

      <div className={styles.rightPane}>
        {selectedRecord ? (
          <>
            <CoverFlow onSelectRecord={setSelectedRecord} {...{ records, selectedRecord }} />
            <RecordDetails record={selectedRecord} />
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </>
  )
}

function CollectionListSortHeader({ sortBy, setSortBy }) {
  return (
    <div className={styles.sortBar}>
      <h2 className={styles.subTitle}>Collection List</h2>

      <div className={styles.sortSelector}>
        <span className={styles.sortLabel}>Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.sortDropdown}
        >
          <option value="artist">Artist</option>
          <option value="genre">Genre</option>
          <option value="year">Year</option>
        </select>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className={styles.empty}>
      <Info size={48} className={styles.emptyIcon} />

      <p className={styles.emptyText}>
        Select a record from the list to view it's details and interact with the Cover Flow layout.
      </p>
    </div>
  )
}