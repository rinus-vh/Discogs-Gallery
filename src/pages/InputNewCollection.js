/** @typedef {import('../types').VinylRecord} VinylRecord */
/** @typedef {import('../types').LogEntry} LogEntry */

import { useState, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { FileUp, Key, Play, RotateCcw, StopCircle } from 'lucide-react'

import { parseCsv, generateCsv, downloadCsv } from '../utils/csvHelpers'
import { processRecords } from '../utils/processScript'
import { useAppContext } from '../context/AppContext'

import { ProgressBar } from '../features/ProgressBar'
import { LogViewer } from '../features/LogViewer'
import { ButtonGray, ButtonOrange } from '../features/Button'

import styles from './InputNewCollection.module.css'

export function InputNewCollection() {
  const {
    setRecords,
    addLog,
    clearLogs,
    isProcessing,
    setIsProcessing,
    progress,
    setProgress,
    setPage,
    discogsToken,
    setDiscogsToken,
    records,
    discogsFile,
    setDiscogsFile,
    setHasViewedCollection
  } = useAppContext()

  /** @type {[string, (error: string) => void]} */
  const [tokenError, setTokenError] = useState('')
  /** @type {[string, (error: string) => void]} */
  const [fileError, setFileError] = useState('')
  const [stopProcessing, setStopProcessing] = useState(false)
  const formRef = useRef(null)

  const discogsDropzone = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    disabled: isProcessing,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setDiscogsFile(acceptedFiles[0])
        setFileError('')
      }
    }
  })

  function resetForm() {
    formRef.current?.reset()
    setDiscogsFile(null)
    setDiscogsToken('')
    setProgress(0)
    clearLogs()
  }

  function validateForm() {
    let valid = true
    if (!discogsFile) {
      setFileError('Please upload a Discogs CSV export')
      valid = false
    }
    if (!discogsToken) {
      setTokenError('Please enter your Discogs API token')
      valid = false
    }
    return valid
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsProcessing(true)
      setStopProcessing(false)
      clearLogs()
      setProgress(0)

      /** @type {LogEntry} */
      const startLog = { message: `📊 Parsing ${discogsFile?.name}...`, type: 'info' }
      addLog(startLog)

      /** @type {VinylRecord[]} */
      const discogsData = await parseCsv(discogsFile)

      /** @type {LogEntry} */
      const processingLog = { message: '🚀 Processing records...', type: 'info' }
      addLog(processingLog)

      /** @type {VinylRecord[]} */
      const processedRecords = await processRecords(
        discogsData,
        discogsToken,
        (p) => {
          if (stopProcessing) throw new Error('STOP_PROCESSING')
          setProgress(p)
        },
        (msg) => addLog({ message: msg, type: 'info' })
      )

      setRecords(processedRecords)
      setHasViewedCollection(true)

      /** @type {LogEntry} */
      const successLog = { message: `✅ Processed ${processedRecords.length} records successfully!`, type: 'success' }
      addLog(successLog)

      setTimeout(() => setPage('edit'), 1000)

    } catch (error) {
      console.error(error)

      if (error instanceof Error && error.message === 'STOP_PROCESSING') {
        /** @type {LogEntry} */
        const stopLog = { message: '⏹️ Processing stopped. Saving current progress...', type: 'warning' }
        addLog(stopLog)

        /** @type {VinylRecord[]} */
        const current = records

        if (current.length > 0) {
          const csvContent = await generateCsv(current)
          downloadCsv(csvContent, 'partial_vinyl_collection.csv')
          setPage('edit')
        }
      } else {
        /** @type {LogEntry} */
        const errorLog = { message: `❌ Error: ${error?.message || 'An unknown error occurred'}`, type: 'error' }
        addLog(errorLog)
      }
    } finally {
      setIsProcessing(false)
      setStopProcessing(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Process New Collection</h1>

      <form ref={formRef} onSubmit={handleSubmit} className={styles.form}>
        <CsvDropzone dropzone={discogsDropzone} file={discogsFile} fileError={fileError} />

        <TokenInput
          token={discogsToken}
          setToken={setDiscogsToken}
          isDisabled={isProcessing}
          onChange={() => setTokenError('')}
          {...{ tokenError }}
        />

        {isProcessing && <ProcessingLogs progress={progress} />}

        <ActionButtons
          onStop={() => setStopProcessing(true)}
          onReset={resetForm}
          {...{ isProcessing }}
        />
      </form>
    </div>
  )
}

/** @param {{ dropzone: any, file: File, fileError: string }} props */
function CsvDropzone({ dropzone, file, fileError }) {
  const { getRootProps, getInputProps, isDragActive } = dropzone

  const statusClassName = fileError
    ? styles.error
    : file
      ? styles.success
      : isDragActive
        ? styles.active
        : styles.idle

  return (
    <div>
      <label className={styles.label}>Discogs CSV Export (Required)</label>

      <div {...getRootProps()} className={cx(styles.dropzone, statusClassName)}>
        <input {...getInputProps()} />
        
        {file ? (
          <div className={styles.dropInfo}>
            <FileUp className={styles.iconSuccess} size={24} />
            <span className={styles.fileName}>{file.name}</span>
          </div>
        ) : isDragActive ? (
          <p className={styles.dropActiveText}>Drop the file here...</p>
        ) : (
          <div className={styles.dropPrompt}>
            <FileUp className={styles.iconDefault} />
            <p className={styles.dropText}>Drag & drop a CSV file or click to browse</p>
          </div>
        )}
      </div>
      {fileError && <p className={styles.errorText}>{fileError}</p>}
    </div>
  )
}

/**
 * @param {{
 *  token: string,
 *  setToken: Function,
 *  tokenError: string,
 *  isDisabled: boolean,
 *  onChange: () => void
 * }} props
 */
function TokenInput({ token, setToken, tokenError, isDisabled, onChange }) {
  return (
    <div>
      <label className={styles.label}>Discogs API Token (Required)</label>
      <div className={styles.inputWrapper}>
        <div className={styles.inputIcon}>
          <Key className={styles.iconDefault} />
        </div>

        <input
          type="text"
          value={token}
          onChange={(e) => {
            setToken(e.target.value)
            onChange()
          }}
          disabled={isDisabled}
          className={cx(styles.input, tokenError && styles.inputError)}
          placeholder="Enter your Discogs personal access token"
        />
      </div>

      {tokenError && <p className={styles.errorText}>{tokenError}</p>}
    </div>
  )
}

/** @param {{ progress: number }} props */
function ProcessingLogs({ progress }) {
  return (
    <div className={styles.processingLogs}>
      <ProgressBar progress={progress} />
      <LogViewer maxHeight="300px" />
    </div>
  )
}

/** @param {{ isProcessing: boolean, onStop: () => void, onReset: () => void }} props */
function ActionButtons({ isProcessing, onStop, onReset }) {
  return (
    <div className={styles.componentActionButtons}>
      {isProcessing ? (
        <ButtonGray
          onClick={onStop}
          label="Stop Processing"
          Icon={StopCircle}
          layoutClassName={styles.buttonStopLayout}
        />
      ) : (
        <ButtonOrange
          type="submit"
          label="Process Collection"
          Icon={Play}
          layoutClassName={styles.buttonSubmitLayout}
        />
      )}
      <ButtonGray
        onClick={onReset}
        label="Reset"
        Icon={RotateCcw}
        disabled={isProcessing}
      />
    </div>
  )
}