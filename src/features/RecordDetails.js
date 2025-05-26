/** @typedef {import('types').VinylRecord} VinylRecord */

import { useState } from 'react'
import { Music, Disc, Tag, Calendar, Pencil, ExternalLink } from 'lucide-react'
import { useAppContext } from '../context/AppContext'

import styles from './RecordDetails.module.css'

/**
 * @param {{ record: VinylRecord }} props
 */
export function RecordDetails({ record }) {
  const { records, setRecords } = useAppContext()
  const [isEditingGenre, setIsEditingGenre] = useState(false)

  const primaryGenre = record['Primary Genre'] || (record.Genres?.length ? record.Genres[0] : '')
  const uniqueLabels = record.Label ? Array.from(new Set(record.Label)) : []

  /**
   * @param {string} newPrimaryGenre
   */
  function handlePrimaryGenreChange(newPrimaryGenre) {
    setIsEditingGenre(false)

    const updatedRecords = records.map((r) =>
      r.id === record.id ? { ...r, 'Primary Genre': newPrimaryGenre } : r
    )

    const sortedRecords = [...updatedRecords].sort((a, b) => {
      const genreA = a['Primary Genre'] || a.Genres?.[0] || ''
      const genreB = b['Primary Genre'] || b.Genres?.[0] || ''
      if (genreA !== genreB) return genreA.localeCompare(genreB)
      if (a.Artist !== b.Artist) return a.Artist.localeCompare(b.Artist)
      return (a.Released?.toString() || '').localeCompare(b.Released?.toString() || '')
    })

    setRecords(sortedRecords)

    setTimeout(() => {
      document.getElementById(`record-${record.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }, 100)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <RecordHeader title={record.Title} artist={record.Artist} releaseId={record.release_id} />

        <div className={styles.grid}>
          <InfoBlock icon={Calendar} label="Year" value={record.Released || '-'} />
          <GenreSelector
            record={record}
            primaryGenre={primaryGenre}
            isEditing={isEditingGenre}
            setIsEditing={setIsEditingGenre}
            onChange={handlePrimaryGenreChange}
          />
        </div>

        <GenrePills genres={record.Genres} />
        {uniqueLabels.length > 0 && <LabelList labels={uniqueLabels} />}
      </div>
    </div>
  )
}

/**
 * @param {{ title: string, artist: string, releaseId: string }} props
 */
function RecordHeader({ title, artist, releaseId }) {
  return (
    <div>
      <div className={styles.titleRow}>
        <h2 className={styles.title}>{title}</h2>
        <a
          href={`https://www.discogs.com/release/${releaseId}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.discogsLink}
        >
          <ExternalLink size={16} />
        </a>
      </div>
      <div className={styles.artistRow}>
        <Music size={16} className={styles.icon} />
        <span className={styles.artistName}>{artist}</span>
      </div>
    </div>
  )
}

/**
 * @param {{ icon: React.ElementType, label: string, value: string | number }} props
 */
function InfoBlock({ icon: Icon, label, value }) {
  return (
    <div className={styles.block}>
      <div className={styles.blockLabel}>
        <Icon size={16} className={styles.icon} />
        <span className={styles.blockLabelText}>{label}</span>
      </div>
      <p className={styles.blockValue}>{value}</p>
    </div>
  )
}

/**
 * @param {{
 *   record: VinylRecord,
 *   primaryGenre: string,
 *   isEditing: boolean,
 *   setIsEditing: (val: boolean) => void,
 *   onChange: (genre: string) => void
 * }} props
 */
function GenreSelector({ record, primaryGenre, isEditing, setIsEditing, onChange }) {
  return (
    <div className={styles.block + ' ' + styles.genreSelector}>
      <div className={styles.blockLabel}>
        <Tag size={16} className={styles.icon} />
        <span className={styles.blockLabelText}>Primary Genre</span>
      </div>

      {isEditing ? (
        <select
          autoFocus
          className={styles.genreSelect}
          value={primaryGenre}
          onChange={(e) => onChange(e.target.value)}
          onBlur={() => setIsEditing(false)}
        >
          {record.Genres?.map((genre) => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      ) : (
        <>
          <p className={styles.blockValue}>{primaryGenre || 'No Genre'}</p>
          {record.Genres?.length > 1 && (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.editButton}
            >
              <Pencil size={14} className={styles.iconWhite} />
            </button>
          )}
        </>
      )}
    </div>
  )
}

/**
 * @param {{ genres: string[] }} props
 */
function GenrePills({ genres }) {
  if (!genres?.length) return null

  return (
    <div className={styles.block}>
      <div className={styles.blockLabel}>
        <Tag size={16} className={styles.icon} />
        <span className={styles.blockLabelText}>All Genres</span>
      </div>
      <div className={styles.pillWrapper}>
        {genres.map((genre, index) => (
          <span
            key={`${genre}-${index}`}
            className={styles.pill}
          >
            {genre}
          </span>
        ))}
      </div>
    </div>
  )
}

/**
 * @param {{ labels: string[] }} props
 */
function LabelList({ labels }) {
  return (
    <div className={styles.block}>
      <div className={styles.blockLabel}>
        <Disc size={16} className={styles.icon} />
        <span className={styles.blockLabelText}>
          Label{labels.length > 1 ? 's' : ''}
        </span>
      </div>
      <p className={styles.blockValue}>{labels.join(', ')}</p>
    </div>
  )
}