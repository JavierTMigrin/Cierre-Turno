import { useState, useCallback } from 'react'
import Home from './components/Home.jsx'
import ShiftForm from './components/ShiftForm.jsx'
import History from './components/History.jsx'

export default function App() {
  const [view, setView] = useState('home')
  const [activePlant, setActivePlant] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const openForm = useCallback((plantId) => {
    setActivePlant(plantId)
    setView('form')
    window.scrollTo(0, 0)
  }, [])

  const goHome = useCallback(() => {
    setView('home')
    setActivePlant(null)
    window.scrollTo(0, 0)
  }, [])

  const goHistory = useCallback(() => {
    setView('history')
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="app">
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      {view === 'home' && (
        <Home onOpenForm={openForm} onOpenHistory={goHistory} />
      )}
      {view === 'form' && activePlant && (
        <ShiftForm
          plant={activePlant}
          onBack={goHome}
          onSaved={(msg) => showToast(msg)}
        />
      )}
      {view === 'history' && (
        <History onBack={goHome} />
      )}
    </div>
  )
}
