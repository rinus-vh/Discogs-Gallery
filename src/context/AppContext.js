import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [page, setPage] = useState('home')
  const [records, setRecords] = useState([])
  const [logs, setLogs] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [discogsToken, setDiscogsToken] = useState('')
  const [discogsFile, setDiscogsFile] = useState(null)
  const [hasViewedCollection, setHasViewedCollection] = useState(false)
  const [showHomeModal, setShowHomeModal] = useState(false)

  const addLog = (log) => setLogs((prev) => [...prev, log])
  const clearLogs = () => setLogs([])

  return (
    <AppContext.Provider
      value={{
        page, setPage,
        records, setRecords,
        logs, addLog, clearLogs,
        isProcessing, setIsProcessing,
        progress, setProgress,
        selectedRecord, setSelectedRecord,
        discogsToken, setDiscogsToken,
        discogsFile, setDiscogsFile,
        hasViewedCollection, setHasViewedCollection,
        showHomeModal, setShowHomeModal,
      }}
      {...{ children }}
    />
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within an AppProvider')
  return context
}
