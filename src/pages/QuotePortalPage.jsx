import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card'
import { Badge } from '../shared/ui/badge'
import { Button } from '../shared/ui/button'
import { Skeleton } from '../shared/ui/skeleton'
import { formatCurrency } from '../shared/lib/quote'
import { useQuotePortal } from '../hooks/useQuotePortal'
import { usePortalDashboard } from '../hooks/usePortalDashboard'
import { useToast } from '../hooks/use-toast'

const STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  scheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  default: 'bg-slate-100 text-slate-700'
}

function StatusBadge({ label, status = 'default' }) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.default
  return (
    <Badge className={`${color} font-medium`} variant="outline">
      {label}
    </Badge>
  )
}

function QuoteTotals({ quote }) {
  const total = useMemo(() => {
    if (!quote?.total) return 0
    return typeof quote.total === 'number' ? quote.total : Number(quote.total) || 0
  }, [quote])

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Quote total</p>
        <p className="text-3xl font-bold text-primary mt-1">{formatCurrency(total)}</p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Included items</p>
        <ul className="space-y-1 text-sm">
          {(quote?.items || []).map((item) => (
            <li key={item.sku || item.id} className="flex justify-between">
              <span>{item.name}</span>
              <span className="text-muted-foreground">× {item.qty || item.quantity || 1}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function PhotoGrid({ photos }) {
  const gridItems = useMemo(() => {
    const placeholders = Array.from({ length: 6 }, (_, index) => ({
      id: `placeholder-${index}`,
      url: null
    }))

    return [...(photos?.items || []), ...placeholders].slice(0, 6)
  }, [photos])

  return (
    <div className="grid grid-cols-3 gap-3">
      {gridItems.map((item) => (
        <div
          key={item.id}
          className="aspect-square rounded-xl border border-dashed flex items-center justify-center text-muted-foreground text-xs bg-muted/40"
          style={item.url ? { backgroundImage: `url(${item.url})`, backgroundSize: 'cover' } : undefined}
        >
          {!item.url ? 'Photo' : null}
        </div>
      ))}
    </div>
  )
}

function DocumentList({ documents }) {
  if (!documents?.length) {
    return <p className="text-sm text-muted-foreground">Documents will appear here once generated.</p>
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <a
          key={doc.id || doc.url}
          href={doc.url}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition hover:bg-muted"
        >
          <span className="font-medium">{doc.name}</span>
          <Badge variant="secondary" className="capitalize">
            {doc.type || 'Document'}
          </Badge>
        </a>
      ))}
    </div>
  )
}

export default function QuotePortalPage() {
  const searchParams = new URLSearchParams(window.location.search)
  const initialEstimateId = searchParams.get('estimateId') || window.caEstimateId || null
  const initialLocationId = searchParams.get('locationId') || window.caLocationId || null
  const initialInviteToken = searchParams.get('inviteToken') || window.caPortalInviteToken || null
  const { toast } = useToast()

  const {
    data: dashboard,
    error: dashboardError,
    isLoading: isDashboardLoading,
    isRefreshing: isDashboardRefreshing,
    refresh: refreshDashboard
  } = usePortalDashboard()

  const [activeEstimateId, setActiveEstimateId] = useState(initialEstimateId)

  useEffect(() => {
    if (!initialEstimateId && dashboard?.estimates?.length) {
      setActiveEstimateId(dashboard.estimates[0].estimateId)
    }
  }, [initialEstimateId, dashboard])

  const activeEstimate = useMemo(
    () => (dashboard?.estimates || []).find((item) => item.estimateId === activeEstimateId) || null,
    [dashboard, activeEstimateId]
  )

  const effectiveLocationId = initialLocationId || activeEstimate?.locationId || null

  const { data, error, isLoading, isRefreshing, actions } = useQuotePortal({
    estimateId: activeEstimateId,
    locationId: effectiveLocationId,
    inviteToken: initialInviteToken
  })

  const quote = data?.quote
  const photos = data?.photos
  const installation = data?.installation
  const documents = data?.documents
  const account = data?.account

  const accountPortalUrl = account?.portalUrl || activeEstimate?.portalUrl || null
  const accountLastInviteAt = account?.lastInviteAt || activeEstimate?.lastInviteAt || null
  const accountResetUrl = account?.resetUrl || activeEstimate?.resetUrl || null

  const handleRefresh = async () => {
    try {
      await Promise.all([
        refreshDashboard(),
        actions.refresh()
      ])
      toast({
        title: 'Portal refreshed',
        description: 'Latest information loaded.'
      })
    } catch (err) {
      toast({
        title: 'Refresh failed',
        description: err instanceof Error ? err.message : 'Please try again shortly.',
        variant: 'destructive'
      })
    }
  }

  const handleUploadMore = () => {
    toast({
      title: 'Opening upload portal',
      description: 'You can add more photos on the next page.'
    })
    actions.uploadMorePhotos()
  }

  const handleScheduleInstall = () => {
    toast({
      title: 'Scheduling installation',
      description: 'We will guide you to the scheduling flow.'
    })
    actions.scheduleInstallation()
  }

  const noEstimates = !isDashboardLoading && (!dashboard?.estimates || dashboard.estimates.length === 0)

  return (
    <div className="min-h-screen bg-muted/20 pb-24">
      <header className="bg-white border-b">
        <div className="container mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Secure portal access</p>
              <h1 className="text-3xl font-bold mt-1">Your Client Portal</h1>
            </div>

            <div className="flex items-center gap-2">
              {quote?.statusLabel ? (
                <StatusBadge label={quote.statusLabel} status={quote.status} />
              ) : null}
              {quote?.number ? (
                <Badge variant="outline" className="font-semibold">{`#${quote.number}`}</Badge>
              ) : null}
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading || isDashboardRefreshing || isDashboardLoading}
              >
                {isRefreshing || isDashboardRefreshing ? 'Refreshing…' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8 space-y-6">
        {dashboardError ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">We ran into an issue loading your portal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-red-700">
              <p>{dashboardError}</p>
              <Button variant="destructive" onClick={() => refreshDashboard()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {error ? (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700">We ran into an issue loading quote details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-red-700">
              <p>{error}</p>
              <Button variant="destructive" onClick={() => actions.refresh()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {noEstimates ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No quotes yet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>We don’t have any quotes linked to your account yet. Once you accept a quote, it will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Your quotes &amp; orders</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select a quote to view details, documents, and installation progress.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {isDashboardLoading ? (
                  Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />)
                ) : (
                  (dashboard?.estimates || []).map((item) => {
                    const isActive = item.estimateId === activeEstimateId
                    return (
                      <button
                        key={item.estimateId}
                        type="button"
                        onClick={() => setActiveEstimateId(item.estimateId)}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                          isActive ? 'border-primary bg-primary/5' : 'hover:border-primary/60'
                        }`}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold">{item.number || item.estimateId}</span>
                          <StatusBadge label={item.statusLabel} status={item.status} />
                        </div>
                        {item.acceptedAt ? (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Accepted {new Date(item.acceptedAt).toLocaleDateString()}
                          </p>
                        ) : null}
                      </button>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              {!activeEstimateId ? (
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle>Select a quote</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    Choose a quote from the list on the left to view its details, upload photos, or download documents.
                  </CardContent>
                </Card>
              ) : (
                <section className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Account</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Portal access activates automatically when your agreement is accepted.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? (
                        <Skeleton className="h-32 w-full" />
                      ) : (
                        <>
                          <div className="space-y-1">
                            <StatusBadge label={account?.statusLabel || 'Invite pending'} status={account?.status} />
                            <p className="text-sm text-muted-foreground">
                              {account?.status === 'active'
                                ? 'Customer can access the portal.'
                                : 'We will email an invite as soon as your agreement is accepted.'}
                            </p>
                          </div>
                          {accountPortalUrl ? (
                            <div className="rounded-lg border p-3">
                              <p className="text-xs uppercase text-muted-foreground">Portal link</p>
                              <a
                                href={accountPortalUrl}
                                className="mt-1 break-all text-sm font-medium text-primary hover:underline"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {accountPortalUrl}
                              </a>
                            </div>
                          ) : null}
                          {accountResetUrl ? (
                            <div className="rounded-lg border p-3 bg-muted/40">
                              <p className="text-xs uppercase text-muted-foreground">Password reset link</p>
                              <a
                                href={accountResetUrl}
                                className="mt-1 break-all text-sm font-medium text-primary hover:underline"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {accountResetUrl}
                              </a>
                            </div>
                          ) : null}
                          {accountLastInviteAt ? (
                            <p className="text-xs text-muted-foreground">
                              Last invite sent at {new Date(accountLastInviteAt).toLocaleString()}
                            </p>
                          ) : null}
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Your Quote</CardTitle>
                      <p className="text-sm text-muted-foreground">Review the system configuration and total.</p>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <Skeleton className="h-48 w-full" /> : <QuoteTotals quote={quote} />}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle>Submitted Photos</CardTitle>
                        <p className="text-sm text-muted-foreground">We use these to fine-tune installation planning.</p>
                      </div>
                      <Button variant="outline" onClick={handleUploadMore} disabled={isLoading}>
                        Add more
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? (
                        <Skeleton className="h-48 w-full" />
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">{photos?.total || 0} photos</Badge>
                            {photos?.missingCount ? (
                              <Badge variant="destructive">{photos.missingCount} still needed</Badge>
                            ) : null}
                          </div>
                          <PhotoGrid photos={photos} />
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle>Installation</CardTitle>
                        <p className="text-sm text-muted-foreground">Scheduling opens after you approve the quote.</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleScheduleInstall}
                        disabled={isLoading || installation?.canSchedule === false}
                      >
                        {installation?.status === 'scheduled' ? 'View schedule' : 'Schedule install'}
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isLoading ? (
                        <Skeleton className="h-32 w-full" />
                      ) : (
                        <div className="space-y-2">
                          <StatusBadge label={installation?.statusLabel || 'Not scheduled'} status={installation?.status} />
                          <p className="text-sm text-muted-foreground">
                            {installation?.message || 'You can schedule your installation once the quote is accepted.'}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Documents</CardTitle>
                      <p className="text-sm text-muted-foreground">Download your paperwork anytime.</p>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? <Skeleton className="h-32 w-full" /> : <DocumentList documents={documents} />}
                    </CardContent>
                  </Card>
                </section>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

