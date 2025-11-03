import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QuoteHeader } from '../components/QuoteHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Alert, AlertDescription } from '../shared/ui/alert';
import { fetchEstimate } from '../lib/quoteStorage';
import { CheckCircle, Clock, Phone, Mail, ArrowLeft, AlertTriangle } from 'lucide-react';

// Thank you page component that confirms successful photo submission
// Shows next steps and contact information for the customer
export default function ThankYouPage() {
  const [searchParams] = useSearchParams();
  const estimateId = searchParams.get("estimateId");
  const locationId = searchParams.get("locationId");
  const [quoteData, setQuoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load quote data to display customer information
  useEffect(() => {
    async function loadEstimate() {
      try {
        setIsLoading(true);
        
        // Fetch quote data from WordPress API
        const data = await fetchEstimate(estimateId, locationId);
        setQuoteData(data);
        
      } catch (err) {
        console.error('Error loading estimate:', err);
        // Set quoteData to null to show error state
        setQuoteData(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadEstimate();
  }, [estimateId, locationId]);

  // Handle back to quote action
  const handleBackToQuote = () => {
    const params = new URLSearchParams();
    if (estimateId) params.append('estimateId', estimateId);
    if (locationId) params.append('locationId', locationId);
    
    window.location.href = `/quote?${params.toString()}`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error state if quote couldn't be loaded
  if (!quoteData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Estimate Not Found
            </CardTitle>
            <CardDescription>
              Could not load estimate data. Please check your link or try again.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Quote Header */}
      <QuoteHeader quoteId={quoteData?.quoteId} locationId={locationId} showPhotoButton={false} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Photos Submitted Successfully!
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Thank you for providing the site photos. We've received your submission and will review 
            your installation requirements to provide you with an accurate quote.
          </p>
        </div>

        {/* Next Steps Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              What Happens Next?
            </CardTitle>
            <CardDescription>
              Here's what you can expect in the coming days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Photo Review</h4>
                  <p className="text-sm text-gray-600">
                    Our team will review your photos to assess installation requirements and site conditions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Quote Refinement</h4>
                  <p className="text-sm text-gray-600">
                    We'll update your quote based on the actual site conditions and installation complexity.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Final Quote Delivery</h4>
                  <p className="text-sm text-gray-600">
                    You'll receive your final quote within 24-48 hours via email and phone call.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        {quoteData && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Quote Information</CardTitle>
              <CardDescription>
                Quote details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Quote Number</p>
                  <p className="font-medium">{quoteData.quoteId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer Name</p>
                  <p className="font-medium">{quoteData.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{quoteData.customer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{quoteData.customer.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contact Support */}
        <Alert className="bg-blue-50 border-blue-200 mb-6">
          <Phone className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Questions?</strong> If you have any questions about your quote or installation, 
            please don't hesitate to contact us at <strong>1300 123 456</strong> or email us at 
            <strong> quotes@cheapalarms.com.au</strong>
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleBackToQuote}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Quote
          </Button>
          
          <Button
            onClick={() => window.location.href = 'mailto:quotes@cheapalarms.com.au'}
            className="flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            Email Us
          </Button>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Thank you for choosing Cheap Alarms for your security needs.
          </p>
        </div>
      </div>
    </div>
  );
}
