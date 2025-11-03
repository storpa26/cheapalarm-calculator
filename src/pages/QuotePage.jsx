import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuoteHeader } from '../components/QuoteHeader';
import { ItemsTable } from '../components/ItemsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { Alert, AlertDescription } from '../shared/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../shared/ui/collapsible';
import { Skeleton } from '../shared/ui/skeleton';
import { fetchEstimate, checkAdminStatus } from '../lib/quoteStorage';
import { updateEstimatePrices } from '../lib/estimateApi';
import { ChevronDown, Info, AlertTriangle, Save } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

// Quote page component that displays quote details and customer information
// Fetches quote data from WordPress API and displays it in a clean format
export default function QuotePage() {
  const [searchParams] = useSearchParams();
  const estimateId = searchParams.get("estimateId");
  const locationId = searchParams.get("locationId");
  const adminParam = searchParams.get("admin") === "1"; // Admin mode via URL param
  const [quoteData, setQuoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(false);
  const { toast } = useToast();
  const lastCheckedAdminParam = useRef(null);

  // Early validation: require estimateId
  if (!estimateId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Invalid Link
            </CardTitle>
            <CardDescription>
              This page requires an estimate ID. Please use the link provided in your estimate email.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Check admin status if admin param is present (only check once per adminParam value)
  useEffect(() => {
    // Skip if we've already checked this adminParam value
    if (lastCheckedAdminParam.current === adminParam) return;
    
    async function verifyAdmin() {
      lastCheckedAdminParam.current = adminParam;
      
      if (adminParam) {
        // On localhost, allow admin mode without backend check for development
        // UNLESS guest=true is in URL (for testing guest view)
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname.includes('localhost');
        const isGuest = searchParams.get("guest") === "1";
        
        if (isLocalhost && !isGuest) {
          console.log('Localhost detected - enabling admin mode without backend check');
          setIsAdmin(true);
          setIsCheckingAdmin(false);
          return;
        }
        
        // On production, check backend
        setIsCheckingAdmin(true);
        try {
          console.log('Checking admin status...');
          const adminStatus = await checkAdminStatus();
          console.log('Admin status result:', adminStatus);
          setIsAdmin(adminStatus);
          if (!adminStatus) {
            toast({
              title: "Access Denied",
              description: "You must be logged in as a WordPress administrator to access admin mode.",
              variant: "destructive",
            });
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          setIsAdmin(false);
          toast({
            title: "Admin Check Failed",
            description: "Could not verify admin status. Please ensure you're logged into WordPress.",
            variant: "destructive",
          });
        } finally {
          setIsCheckingAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }

    verifyAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminParam]); // Only depend on adminParam, not toast

  // Load quote data when component mounts or URL parameters change
  useEffect(() => {
    async function loadEstimate() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch quote data from WordPress API
        const data = await fetchEstimate(estimateId, locationId);
        setQuoteData(data);
        
      } catch (err) {
        console.error('Error loading estimate:', err);
        setError(err instanceof Error ? err.message : "Failed to load estimate");
      } finally {
        setIsLoading(false);
      }
    }

    loadEstimate();
  }, [estimateId, locationId]);

  // Show loading state while fetching data or checking admin status
  if (isLoading || (adminParam && isCheckingAdmin)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Show error state if quote couldn't be loaded
  if (error || !quoteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Estimate Not Found
            </CardTitle>
            <CardDescription>
              {error || "Could not load estimate data. Please check your link or try again."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingBottom: '32px' }}>
      {/* Quote Header with navigation */}
      <QuoteHeader quoteId={quoteData.quoteId} locationId={locationId} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Admin Mode Banner */}
        {isAdmin && (
          <Alert className="bg-blue-50 border-blue-200 rounded-xl p-4 mb-6">
            <Info className="h-5 w-5 text-blue-600" />
            <AlertDescription className="text-base font-medium text-blue-900 ml-3">
              <strong>Admin Mode:</strong> You can edit item prices. After updating prices, click "Update All Prices" to save changes to the estimate.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Customer Information Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          marginBottom: '24px'
        }}>
          <div style={{ padding: '32px 32px 24px 32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#111827', 
              margin: '0 0 8px 0' 
            }}>
              Customer Information
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: '0',
              fontWeight: '500'
            }}>
              Contact details and property information
            </p>
          </div>
          <div style={{ padding: '0 32px 32px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0' }}>Name</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{quoteData.customer.name}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0' }}>Email</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{quoteData.customer.email}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0' }}>Phone</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{quoteData.customer.phone}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0' }}>Solution Type</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{quoteData.solution}</p>
              </div>
            </div>
            <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb', marginTop: '16px' }}>
              <p style={{ fontSize: '12px', fontWeight: '500', color: '#6b7280', margin: '0 0 4px 0' }}>Site Address</p>
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0' }}>{quoteData.customer.address}</p>
            </div>
          </div>
        </div>

        {/* Quote Items Card */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          marginBottom: '24px'
        }}>
          <div style={{ padding: '32px 32px 24px 32px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              color: '#111827', 
              margin: '0 0 8px 0' 
            }}>
              Quote Items
            </h2>
            <p style={{ 
              fontSize: '14px', 
              color: '#6b7280', 
              margin: '0',
              fontWeight: '500'
            }}>
              Your selected security equipment and specifications
            </p>
          </div>
          <div style={{ padding: '0 32px 32px 32px' }}>
            <ItemsTable items={quoteData.items} isAdmin={isAdmin} onItemsChange={(items) => setQuoteData({ ...quoteData, items })} />
          </div>
          {isAdmin && (
            <div style={{ 
              padding: '24px 32px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={async () => {
                  setIsUpdating(true);
                  try {
                    await updateEstimatePrices(quoteData.quoteId, locationId, quoteData.items);
                    toast({
                      title: "Prices Updated",
                      description: "All item prices have been updated in the estimate. The estimate link remains the same.",
                    });
                  } catch (err) {
                    toast({
                      title: "Update Failed",
                      description: err instanceof Error ? err.message : "Failed to update prices. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsUpdating(false);
                  }
                }}
                disabled={isUpdating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  backgroundColor: isUpdating ? '#9ca3af' : '#c95375',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isUpdating ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <Save style={{ width: '16px', height: '16px' }} />
                {isUpdating ? 'Updating...' : 'Update All Prices'}
              </button>
            </div>
          )}
        </div>

        {/* Photo Request Call-to-Action */}
        <Alert className="bg-secondary/10 border-secondary/20 rounded-xl p-6">
          <Info className="h-5 w-5 text-secondary" />
          <AlertDescription className="text-base font-medium text-foreground ml-3">
            <strong className="text-secondary">Next Step:</strong> We need photos of your site to refine your quote. 
            Click "Provide Site Photos" above to help us optimise your installation and pricing.
          </AlertDescription>
        </Alert>

        {/* Photo Requirements Information */}
        <Card>
          <CardHeader>
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <CardTitle className="text-lg">What photos do I need?</CardTitle>
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-4">
                    To provide you with the most accurate quote and installation plan, 
                    please provide photos of the following areas:
                  </p>
                  
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Front of property</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Back of property / yard area</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Electrical panel / fuse box</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Internet router / NVR location</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Each device location (where sensors/cameras will be mounted)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>Any cable access points or ceiling voids</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> You can take photos directly from your phone's camera. 
                      Photos help us optimise your quote and installation time.
                    </p>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </CardHeader>
        </Card>

        {/* Footer Note */}
        <Alert>
          <AlertDescription className="text-sm text-muted-foreground">
            No prices are shown here. Final quote will be reviewed by our team after photos are received.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
