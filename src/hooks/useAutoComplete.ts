// src/hooks/useAutoComplete.ts - Custom hook for auto-completion
import { useState, useEffect } from 'react'

interface AutoCompleteState {
  isRunning: boolean
  lastRun: Date | null
  completed: number
}

export function useAutoComplete() {
  const [state, setState] = useState<AutoCompleteState>({
    isRunning: false,
    lastRun: null,
    completed: 0
  })

  const runAutoComplete = async (force = false) => {
    // Don't run if already running
    if (state.isRunning) return

    // Don't run if we ran recently (unless forced)
    if (!force && state.lastRun) {
      const timeDiff = new Date().getTime() - state.lastRun.getTime()
      const oneHour = 60 * 60 * 1000
      if (timeDiff < oneHour) return
    }

    setState(prev => ({ ...prev, isRunning: true }))

    try {
      const response = await fetch('/api/trainer/auto-complete', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setState(prev => ({
          ...prev,
          isRunning: false,
          lastRun: new Date(),
          completed: data.completed || 0
        }))

        if (data.completed > 0) {
          console.log(`Auto-completed ${data.completed} appointments`)
        }
      }
    } catch (error) {
      console.error('Auto-completion failed:', error)
      setState(prev => ({ ...prev, isRunning: false }))
    }
  }

  return {
    ...state,
    runAutoComplete
  }
}

// =================================================================
// EXAMPLE 1: Update Dashboard page
// =================================================================

// src/app/dashboard/page.tsx - Add to your existing dashboard
useEffect(() => {
  if (session && status !== 'loading') {
    // Run auto-completion when dashboard loads
    runAutoComplete()
    
    // Your existing fetchDashboardData...
    fetchDashboardData()
  }
}, [session, status])

// =================================================================
// EXAMPLE 2: Update Client Profile page
// =================================================================

// src/app/clients/[clientId]/page.tsx - Add to existing useEffect
useEffect(() => {
  if (status === 'loading') return
  
  if (!session) {
    router.push('/login')
    return
  }

  // Run auto-completion before fetching client data
  runAutoComplete().then(() => {
    fetchClient() // Your existing function
  })
}, [session, status, router, clientId])

// =================================================================
// EXAMPLE 3: Update Appointments list page  
// =================================================================

// src/app/dashboard/page.tsx or wherever you show appointments
const fetchAppointments = async () => {
  // First run auto-completion
  await runAutoComplete()
  
  // Then fetch fresh appointment data
  const response = await fetch('/api/trainer/appointments')
  // ... your existing logic
}

// =================================================================
// EXAMPLE 4: Manual trigger button (optional)
// =================================================================

// Add this to your dashboard or appointments page
const AutoCompleteButton = () => {
  const { isRunning, runAutoComplete, completed } = useAutoComplete()

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        onClick={() => runAutoComplete(true)} // force = true
        disabled={isRunning}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          fontSize: '13px',
          fontWeight: '500',
          color: 'white',
          backgroundColor: isRunning ? '#9ca3af' : '#059669',
          border: 'none',
          borderRadius: '6px',
          cursor: isRunning ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        {isRunning ? (
          <>
            <div style={{ 
              width: '14px', 
              height: '14px', 
              border: '2px solid white', 
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            Processing...
          </>
        ) : (
          <>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Update Sessions
          </>
        )}
      </button>
      
      {completed > 0 && (
        <p style={{ fontSize: '12px', color: '#059669', margin: '4px 0 0 0' }}>
          ✓ Completed {completed} past sessions
        </p>
      )}
    </div>
  )
}

// =================================================================
// EXAMPLE 5: Simple integration for existing pages
// =================================================================

// Add this to any page where you want auto-completion to run
const runAutoCompleteOnLoad = async () => {
  try {
    await fetch('/api/trainer/auto-complete', { method: 'POST' })
  } catch (error) {
    console.error('Auto-completion failed:', error)
  }
}

// Call it in useEffect
useEffect(() => {
  if (session) {
    runAutoCompleteOnLoad()
  }
}, [session])