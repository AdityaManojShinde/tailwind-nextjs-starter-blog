'use client'

import { useEffect } from 'react'

export default function HydrationErrorSuppressor() {
  useEffect(() => {
    // Suppress hydration warnings for browser extension attributes
    const originalError = console.error
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        (args[0].includes('Extra attributes from the server') ||
          args[0].includes('Hydration failed') ||
          args[0].includes('hydrated but some attributes')) &&
        (args[0].includes('fdprocessedid') ||
          args[0].includes('data-ms-editor') ||
          args[0].includes('data-gramm') ||
          args[0].includes('data-lt-') ||
          args[0].includes('data-lastpass') ||
          args[0].includes('data-1p-') ||
          args[0].includes('data-dashlane'))
      ) {
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return null
}
