import { useCallback, useEffect, useMemo, useState } from 'react'
import { API_BASE, TEST_LOCATION_ID, fetchEstimate, getPhotoStats } from '../lib/quoteStorage'

const INITIAL_STATE = {
  quote: null,
  photos: null,
  installation: null,
  documents: null,
  account: null,
  meta: {}
}

async function fetchPortalSnapshot(estimateId, locationId) {
  try {
    const params = new URLSearchParams({
      estimateId,
      locationId: locationId || TEST_LOCATION_ID
    })

    const response = await fetch(`${API_BASE}/wp-json/ca/v1/portal/status?${params.toString()}`, {
      credentials: 'include'
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    return payload?.ok === false ? null : payload
  } catch (error) {
    // Silently fallback to client-side derived data
    return null
  }
}

function deriveQuoteData(estimateData, portalSnapshot) {
  if (!estimateData) return null

  const total = estimateData.items.reduce((sum, item) => {
    const qty = item.qty || item.quantity || 1
    const amount = typeof item.amount === 'number' ? item.amount : Number(item.amount) || 0
    return sum + amount * qty
  }, 0)

  const portalQuote = portalSnapshot?.quote || {}
  const status = portalQuote.status || (estimateData.submitted ? 'pending' : 'draft')

  return {
    id: estimateData.quoteId,
    number: portalQuote.number || estimateData.quoteId || estimateData.estimateId,
    total,
    items: estimateData.items,
    status,
    statusLabel: portalQuote.statusLabel || (status === 'accepted' ? 'Accepted' : status === 'pending' ? 'Awaiting approval' : 'Draft'),
    canAccept: portalQuote.canAccept ?? status !== 'accepted',
    acceptedAt: portalQuote.acceptedAt || null
  }
}

function derivePhotoData(estimateData, portalSnapshot) {
  const stats = estimateData ? getPhotoStats(estimateData) : null
  const portalPhotos = portalSnapshot?.photos || {}
  const items = portalPhotos.items || []

  return {
    total: portalPhotos.total ?? stats?.totalPhotos ?? 0,
    required: portalPhotos.required ?? null,
    missingCount: portalPhotos.missingCount ?? Math.max((portalPhotos.required || 0) - (portalPhotos.total || stats?.totalPhotos || 0), 0),
    items
  }
}

function deriveInstallationData(portalSnapshot) {
  const installation = portalSnapshot?.installation || {}
  const status = installation.status || 'pending'

  return {
    status,
    statusLabel: installation.statusLabel || (status === 'scheduled' ? 'Scheduled' : 'Not scheduled'),
    scheduledAt: installation.scheduledAt || null,
    message: installation.message || null,
    canSchedule: installation.canSchedule ?? status !== 'scheduled'
  }
}

function deriveDocuments(portalSnapshot) {
  return portalSnapshot?.documents || []
}

function deriveAccountData(portalSnapshot) {
  if (!portalSnapshot?.account) {
    return null
  }

  const account = portalSnapshot.account
  return {
    status: account.status || 'pending',
    statusLabel: account.statusLabel || 'Invite pending',
    lastInviteAt: account.lastInviteAt || null,
    canResend: account.canResend !== false,
    portalUrl: account.portalUrl || null,
    inviteToken: account.inviteToken || null,
    expiresAt: account.expiresAt || null
  }
}

export function useQuotePortal({ estimateId, locationId }) {
  const [data, setData] = useState(INITIAL_STATE)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(Boolean(estimateId))
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = useCallback(
    async (options = { silent: false }) => {
      if (!estimateId) {
        setError('Missing estimate identifier.')
        setData(INITIAL_STATE)
        setIsLoading(false)
        return
      }

      if (!options.silent) {
        setIsLoading(true)
      } else {
        setIsRefreshing(true)
      }

      try {
        setError(null)
        const [estimateData, portalSnapshot] = await Promise.all([
          fetchEstimate(estimateId, locationId || TEST_LOCATION_ID),
          fetchPortalSnapshot(estimateId, locationId)
        ])

        const quote = deriveQuoteData(estimateData, portalSnapshot)
        const photos = derivePhotoData(estimateData, portalSnapshot)
        const installation = deriveInstallationData(portalSnapshot)
        const documents = deriveDocuments(portalSnapshot)
        const account = deriveAccountData(portalSnapshot)

        setData({
          quote,
          photos,
          installation,
          documents,
          account,
          meta: {
            fetchedAt: new Date().toISOString(),
            portalSnapshot
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load portal data.')
        setData(INITIAL_STATE)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [estimateId, locationId]
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  const uploadMorePhotos = useCallback(() => {
    const params = new URLSearchParams()
    if (estimateId) params.set('estimateId', estimateId)
    if (locationId) params.set('locationId', locationId)
    window.location.href = `/upload?${params.toString()}`
  }, [estimateId, locationId])

  const scheduleInstallation = useCallback(() => {
    const params = new URLSearchParams()
    if (estimateId) params.set('estimateId', estimateId)
    if (locationId) params.set('locationId', locationId)
    window.location.href = `/thank-you?${params.toString()}`
  }, [estimateId, locationId])

  const state = useMemo(
    () => ({
      data,
      error,
      isLoading,
      isRefreshing,
      isAccepting: false,
      isCreatingAccount: false,
      actions: {
        refresh: () => loadData({ silent: true }),
        acceptEstimate: async () => {},
        createAccount: async () => {},
        uploadMorePhotos,
        scheduleInstallation
      }
    }),
    [data, error, isLoading, isRefreshing, loadData, uploadMorePhotos, scheduleInstallation]
  )

  return state
}

