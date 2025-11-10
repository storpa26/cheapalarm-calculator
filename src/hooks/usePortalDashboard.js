import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../lib/quoteStorage'

const INITIAL_DATA = {
  estimates: []
}

export function usePortalDashboard() {
  const [data, setData] = useState(INITIAL_DATA)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = useCallback(
    async (options = { silent: false }) => {
      if (!options.silent) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      try {
        const nonce =
          typeof window !== 'undefined'
            ? window.wpApiSettings?.nonce ||
              document.querySelector('meta[name="wp-rest-nonce"]')?.content ||
              undefined
            : undefined

        setError(null)
        const response = await fetch(`${API_BASE}/wp-json/ca/v1/portal/dashboard`, {
          credentials: 'include',
          headers: nonce ? { 'X-WP-Nonce': nonce } : undefined
        })

        if (!response.ok) {
          const message = await response.text()
          throw new Error(message || 'Failed to load dashboard data.')
        }

        const payload = await response.json()
        setData({
          estimates: Array.isArray(payload.estimates) ? payload.estimates : []
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.')
        setData(INITIAL_DATA)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    []
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  return useMemo(
    () => ({
      data,
      error,
      isLoading,
      isRefreshing,
      refresh: () => loadData({ silent: true })
    }),
    [data, error, isLoading, isRefreshing, loadData]
  )
}

