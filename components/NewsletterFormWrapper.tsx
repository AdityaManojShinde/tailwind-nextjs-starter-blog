'use client'

import { useEffect, useState } from 'react'
import NewsletterForm from 'pliny/ui/NewsletterForm'

const NewsletterFormWrapper = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center pt-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full">
              <input
                className="focus:ring-primary-600 w-72 rounded-md px-4 focus:border-transparent focus:ring-2 focus:outline-none dark:bg-black"
                placeholder="Enter your email"
                disabled
                type="email"
              />
            </div>
            <div className="mt-2 flex w-full rounded-md shadow-sm sm:mt-0 sm:ml-3 sm:w-auto sm:flex-shrink-0">
              <button
                className="bg-primary-500 w-full rounded-md px-4 py-2 font-medium text-white sm:px-3 sm:py-2"
                disabled
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center pt-4">
      <NewsletterForm />
    </div>
  )
}

export default NewsletterFormWrapper
