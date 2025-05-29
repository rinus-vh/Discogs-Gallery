import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileUp, Music, Loader, ArrowRightCircle } from 'lucide-react'

import { parseCsv } from '../utils/csvHelpers'
import { useAppContext } from '../context/AppContext'
import { ButtonOrange, ButtonGray } from '../features/Button'
import { Modal } from '../features/Modal'

import styles from './Home.module.css'

export function Home() {
  const { setPage, setRecords, setDiscogsFile, setHasViewedCollection } = useAppContext()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const handleFileProcess = async (file) => {
    try {
      setIsLoading(true)
      setLoadingMessage('Loading collection...')
      const records = await parseCsv(file)

      setLoadingMessage('Pre-loading album artwork...')
      await Promise.allSettled(
        records.map(record =>
          new Promise(resolve => {
            if (!record['Image url']) return resolve()
            const img = new Image()
            img.onload = img.onerror = resolve
            img.src = record['Image url']
          })
        )
      )

      setRecords(records)
      setHasViewedCollection(true)
      setPage('edit')
    } catch (err) {
      console.error('Error parsing CSV:', err)
      setErrorMessage("Error parsing the CSV file. Please ensure it's a valid CSV.")
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const dropzone = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await handleFileProcess(acceptedFiles[0])
      }
    }
  })

  if (isLoading) return <LoadingState message={loadingMessage} />

  return (
    <div className={styles.page}>
      <IntroHeader />
      <div className={styles.panel}>
        <ButtonOrange
          onClick={() => setPage('input')}
          label='Process New Collection'
          Icon={ArrowRightCircle}
          size='lg'
        />
        <DropzoneArea dropzone={dropzone} />
      </div>

      <ErrorModal
        isOpen={!!errorMessage}
        message={errorMessage}
        onClose={() => setErrorMessage('')}
      />
    </div>
  )
}

function IntroHeader() {
  return (
    <div className={styles.header}>
      <div className={styles.headerIcon}>
        <Music size={48} className={styles.musicIcon} />
      </div>
      <h1 className={styles.headerTitle}>Discogs Collection Gallery</h1>
      <p className={styles.headerSubtitle}>
        Upload your Discogs collection export and organize your vinyl records by genre, artist, and more.
      </p>
    </div>
  )
}

function DropzoneArea({ dropzone }) {
  const { getRootProps, getInputProps, isDragActive } = dropzone

  const rootClass = `${styles.dropzone} ${isDragActive ? styles.dropzoneActive : styles.dropzoneIdle}`

  return (
    <div {...getRootProps()} className={rootClass}>
      <input {...getInputProps()} />
      <FileUp className={styles.uploadIcon} />
      <p className={styles.dropTitle}>
        {isDragActive ? 'Drop your CSV file here' : 'View Existing Collection'}
      </p>
      <p className={styles.dropSubtext}>Drop your CSV file here, or click to browse</p>
    </div>
  )
}

function LoadingState({ message }) {
  return (
    <div className={styles.page}>
      <Loader className={styles.spinner} />
      <h2 className={styles.loadingTitle}>{message}</h2>
      <p className={styles.loadingText}>Please wait while we load your collection</p>
    </div>
  )
}

function ErrorModal({ isOpen, message, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Error">
      <div className={styles.errorModalContent}>
        <p className={styles.errorModalMessage}>{message}</p>
        <div className={styles.errorModalActions}>
          <ButtonGray onClick={onClose} label="Close" />
        </div>
      </div>
    </Modal>
  )
}