/** @typedef {import('types').VinylRecord} VinylRecord */

import { Music } from 'lucide-react'

import styles from './CollectionList.module.css'

/**
 * @param {{
 *   records: VinylRecord[],
 *   selectedRecord: VinylRecord,
 *   onSelectRecord: (r: VinylRecord) => void
 * }} props
 */
export function CollectionList({ records, selectedRecord, onSelectRecord }) {
  return (
    <div className={styles.component}>
      {records.map((record) => (
        <CollectionListItem
          key={record.id}
          isSelected={selectedRecord?.id === record.id}
          {...{ record, onSelectRecord }}
        />
      ))}
    </div>
  )
}

/**
 * @param {{
 *   record: VinylRecord,
 *   isSelected: boolean,
 *   onSelectRecord: (r: VinylRecord) => void
 * }} props
 */
function CollectionListItem({ record, isSelected, onSelectRecord }) {
  return (
    <div
      id={`record-${record.id}`}
      onClick={() => onSelectRecord(record)}
      className={cx(styles.listItem, isSelected && styles.isSelected)}
    >
      <AlbumCover imageUrl={record['Image url']} title={`${record.Artist} - ${record.Title}`} />
      <RecordInfo {...{ record }} />
      <GenreTag genre={record['Primary Genre']} genres={record.Genres} />
    </div>
  )
}

/** @param {{ imageUrl: string, title: string }} props */
function AlbumCover({ imageUrl, title }) {
  return (
    <div className={styles.componentAlbumCover}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={title}
          className={styles.image}
          onError={(e) => { e.target.src = 'https://placehold.co/40x40/333/fff?text=NA' }}
        />
      ) : (
        <div className={styles.iconFallback}>
          <Music size={20} className={styles.icon} />
        </div>
      )}
    </div>
  )
}

/** @param {{ record: VinylRecord }} props */
function RecordInfo({ record }) {
  const { Title, Artist, Released: year } = record
  
  return (
    <div className={styles.componentRecordInfo}>
      <div className={styles.titleRow}>
        <h3 className={styles.title}>{Title}</h3>
        {year > 0 && <span className={styles.year}>{year}</span>}
      </div>

      <p className={styles.artist}>{Artist}</p>
    </div>
  )
}

/** @param {{ genre: string, genres: string[] }} props */
function GenreTag({ genre, genres }) {
  const displayGenre = genre || (genres?.length ? genres[0] : 'NA')

  return (
    <div className={styles.componentGenreTag}>
      <span className={styles.genreTag}>
        {displayGenre}
      </span>
    </div>
  )
}
