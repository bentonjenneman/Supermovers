'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

type ConsentValue = 'unknown' | 'accepted' | 'declined'

interface ConsentContextType {
  consent: ConsentValue
  setConsent: (value: 'accepted' | 'declined') => void
}

const ConsentContext = createContext<ConsentContextType>({
  consent: 'unknown',
  setConsent: () => {},
})

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<ConsentValue>('unknown')

  useEffect(() => {
    const match = document.cookie
      .split('; ')
      .find((row) => row.startsWith('cookie_consent='))
    if (match) {
      const value = match.split('=')[1]
      if (value === 'accepted' || value === 'declined') {
        setConsentState(value)
      }
    }
  }, [])

  function setConsent(value: 'accepted' | 'declined') {
    const maxAge = 60 * 60 * 24 * 365 // 1 year
    document.cookie = `cookie_consent=${value}; max-age=${maxAge}; path=/; samesite=lax; secure`
    setConsentState(value)
  }

  return (
    <ConsentContext.Provider value={{ consent, setConsent }}>
      {children}
    </ConsentContext.Provider>
  )
}

export function useCookieConsent() {
  return useContext(ConsentContext)
}
