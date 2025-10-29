import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuoteHeader } from '../components/QuoteHeader';
import { ItemsTable } from '../components/ItemsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { Alert, AlertDescription } from '../shared/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../shared/ui/collapsible';
import { Skeleton } from '../shared/ui/skeleton';
import { fetchEstimate } from '../lib/quoteStorage';
import { ChevronDown, Info, AlertTriangle } from 'lucide-react';

// Quote page component that displays quote details and customer information
// Fetches quote data from WordPress API and displays it in a clean format
export default function QuotePage() {
  const [searchParams] = useSearchParams();
  const estimateId = searchParams.get("estimateId");
  const locationId = searchParams.get("locationId");
  const [quoteData, setQuoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Show loading state while fetching data
  if (isLoading) {
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
    <div className="min-h-screen bg-background pb-8">
      {/* Quote Header with navigation */}
      <QuoteHeader quoteId={quoteData.quoteId} locationId={locationId} />

      <div className="container mx-auto px-6 py-10 max-w-6xl space-y-8">
        {/* Customer Information Card */}
        <Card className="border-border/40 shadow-card rounded-2xl overflow-hidden">
          <CardHeader className="p-8 pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">Customer Information</CardTitle>
            <CardDescription className="text-base text-muted-foreground font-medium">
              Contact details and property information
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold text-foreground">{quoteData.customer.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg font-semibold text-foreground">{quoteData.customer.email}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-lg font-semibold text-foreground">{quoteData.customer.phone}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Solution Type</p>
                <p className="text-lg font-semibold text-foreground">{quoteData.solution}</p>
              </div>
            </div>
            <div className="pt-4 border-t border-border/40">
              <p className="text-sm font-medium text-muted-foreground">Site Address</p>
              <p className="text-lg font-semibold text-foreground">{quoteData.customer.address}</p>
            </div>
          </CardContent>
        </Card>

        {/* Quote Items Card */}
        <Card className="border-border/40 shadow-card rounded-2xl overflow-hidden">
          <CardHeader className="p-8 pb-6">
            <CardTitle className="text-2xl font-bold text-foreground">Quote Items</CardTitle>
            <CardDescription className="text-base text-muted-foreground font-medium">
              Your selected security equipment and specifications
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <ItemsTable items={quoteData.items} />
          </CardContent>
        </Card>

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
