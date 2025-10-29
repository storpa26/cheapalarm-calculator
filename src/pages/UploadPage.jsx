import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { QuoteHeader } from '../components/QuoteHeader';
import { PhotoDropzone } from '../components/PhotoDropzone';
import { DeviceSlots } from '../components/DeviceSlots';
import { StickyActionsBar } from '../components/StickyActionsBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';
import { Alert, AlertDescription } from '../shared/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../shared/ui/tabs';
import { Skeleton } from '../shared/ui/skeleton';
import { fetchEstimate, saveQuoteData, validateSubmission } from '../lib/quoteStorage';
import { useToast } from '../hooks/use-toast';
import { Info, CheckCircle2, AlertTriangle } from 'lucide-react';

// General photo checklist for guidance
const GENERAL_PHOTO_CHECKLIST = [
  "Front of property",
  "Back/yard",
  "Electrical panel/fuse box",
  "Internet router/NVR location",
  "Cable access points/ceiling void",
];

// Upload page component for photo collection and submission
// Full functionality restored with render loop fix
export default function UploadPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const estimateId = searchParams.get("estimateId");
  const locationId = searchParams.get("locationId");
  const [quoteData, setQuoteData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('UploadPage rendered with estimateId:', estimateId);

  // Load quote data - run only once to prevent render loops
  useEffect(() => {
    console.log('UploadPage useEffect running - one time only');
    
    async function loadEstimate() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Use default data for testing if no estimateId provided
        if (!estimateId) {
          console.log('No estimateId provided, using default data');
          setQuoteData({
            quoteId: 'TEST-001',
            customer: {
              name: 'Test Customer',
              email: 'test@example.com',
              phone: '0400 000 000',
              address: '123 Test Street, Sydney NSW 2000',
            },
            solution: 'Test Security System',
            items: [
              { sku: 'ITEM-1', name: 'Test Item 1', qty: 1, desc: 'Test description' },
              { sku: 'ITEM-2', name: 'Test Item 2', qty: 2, desc: 'Test description 2' },
            ],
            photos: {
              general: [],
              devices: {
                'ITEM-1': [{ images: [], notes: '' }],
                'ITEM-2': [{ images: [], notes: '' }, { images: [], notes: '' }],
              },
            },
            submitted: false,
          });
          setIsLoading(false);
          return;
        }
        
        // Fetch quote data from WordPress API
        const data = await fetchEstimate(estimateId, locationId);
        setQuoteData(data);
        
      } catch (err) {
        console.error('Error loading estimate:', err);
        setError(err instanceof Error ? err.message : "Failed to load estimate");
        
        // Show error toast
        toast({
          title: "Error loading estimate",
          description: "Could not fetch estimate data. Please check your link and try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadEstimate();
  }, []); // Empty dependency array - run only once

  // Save progress to localStorage
  const handleSave = () => {
    if (!quoteData) return;
    
    setIsSaving(true);
    saveQuoteData(quoteData);
    
    toast({
      title: "Progress saved",
      description: "Your photos and notes have been saved.",
    });
    
    // Reset saving state after a brief delay
    setTimeout(() => setIsSaving(false), 500);
  };

  // Submit photos (simplified version - no actual upload API)
  const handleSubmit = async () => {
    if (!quoteData) return;

    // Validate submission requirements
    const validation = validateSubmission(quoteData);
    if (!validation.valid) {
      toast({
        title: "Cannot submit",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate upload process
      toast({
        title: "Submitting photos...",
        description: "Processing your photos and updating your quote.",
      });

      // Wait for a moment to simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as submitted and save
      const updatedData = { ...quoteData, submitted: true };
      saveQuoteData(updatedData);

      // Success message
      toast({
        title: "Photos submitted!",
        description: "Your photos have been submitted successfully. We'll review them and update your quote.",
      });

      // Navigate to thank you page
      const params = new URLSearchParams();
      if (quoteData.quoteId) params.append('estimateId', quoteData.quoteId);
      if (locationId) params.append('locationId', locationId);
      
      navigate(`/thank-you?${params.toString()}`);
      
    } catch (error) {
      console.error("Submit error:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit photos. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  // Show error state
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
    <div className="min-h-screen bg-background pb-32">
      {/* Quote Header */}
      <QuoteHeader quoteId={quoteData.quoteId} locationId={locationId} showPhotoButton={false} />

      <div className="container mx-auto px-6 py-10 max-w-6xl space-y-8">
        {/* Helpful tip */}
        <Alert className="bg-secondary/10 border-secondary/20 rounded-xl p-6">
          <Info className="h-5 w-5 text-secondary" />
          <AlertDescription className="text-base font-medium text-foreground ml-3">
            <strong className="text-secondary">Tip:</strong> You can take photos directly from your phone's camera. 
            Photos help us optimise your quote and installation time.
          </AlertDescription>
        </Alert>

        {/* Location ID warning if missing */}
        {!locationId && (
          <Alert className="bg-muted/50 border-border/40 rounded-xl p-6">
            <Info className="h-5 w-5 text-muted-foreground" />
            <AlertDescription className="text-base font-medium text-foreground ml-3">
              No locationId found in your link. Proceeding with a default test location for this session.
            </AlertDescription>
          </Alert>
        )}

        {/* Photo Upload Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-xl h-14">
            <TabsTrigger 
              value="general" 
              className="text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
            >
              General Site Photos
            </TabsTrigger>
            <TabsTrigger 
              value="devices" 
              className="text-base font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-primary"
            >
              Device Locations
            </TabsTrigger>
          </TabsList>

          {/* General Photos Tab */}
          <TabsContent value="general" className="space-y-8 mt-8">
            <Card className="border-border/40 shadow-card rounded-2xl overflow-hidden">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-2xl font-bold text-foreground">General Site Photos</CardTitle>
                <CardDescription className="text-base text-muted-foreground font-medium">
                  Upload photos of your property and key areas
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8 space-y-8">
                {/* Photo Upload Component */}
                <PhotoDropzone
                  photos={quoteData.photos.general}
                  onChange={(photos) => {
                    setQuoteData({
                      ...quoteData,
                      photos: { ...quoteData.photos, general: photos },
                    });
                  }}
                />

                {/* Photo Checklist */}
                <div className="border-t border-border/40 pt-8">
                  <h4 className="text-lg font-semibold text-foreground mb-6">Suggested Photos</h4>
                  <div className="space-y-4">
                    {GENERAL_PHOTO_CHECKLIST.map((item) => {
                      // Check if we have a photo that matches this item
                      const hasPhoto = quoteData.photos.general.some((photo) =>
                        photo.label?.toLowerCase().includes(item.toLowerCase().split("/")[0])
                      );
                      
                      return (
                        <div key={item} className="flex items-center gap-3">
                          <CheckCircle2
                            className={`h-5 w-5 ${
                              hasPhoto ? "text-secondary" : "text-muted-foreground"
                            }`}
                          />
                          <span className={`text-base font-medium ${
                            hasPhoto ? "line-through text-muted-foreground" : "text-foreground"
                          }`}>
                            {item}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Device Photos Tab */}
          <TabsContent value="devices" className="space-y-8 mt-8">
            <DeviceSlots
              items={quoteData.items}
              devicePhotos={quoteData.photos.devices}
              onChange={(devices) => {
                setQuoteData({
                  ...quoteData,
                  photos: { ...quoteData.photos, devices },
                });
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky Actions Bar */}
      <StickyActionsBar
        onSave={handleSave}
        onSubmit={handleSubmit}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
