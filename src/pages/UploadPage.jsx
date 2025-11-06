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
import { fetchEstimate, validateSubmission } from '../lib/quoteStorage';
import { startUploadSession, uploadPhotosBatch, completeUploadSession, setProgressCallback, retryUpload, cancelAllUploads, getCurrentSession, mapPhotosToEstimate, applyPhotosToEstimate } from '../lib/uploadApi';
import { TEST_LOCATION_ID } from '../lib/quoteStorage';
import { UploadProgress } from '../components/UploadProgress';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploadProgress, setUploadProgress] = useState([]);
  const [showUploadProgress, setShowUploadProgress] = useState(false);

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

  // Load quote data - run only once to prevent render loops
  useEffect(() => {
    async function loadEstimate() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch quote data from WordPress API
        const data = await fetchEstimate(estimateId, locationId);
        setQuoteData(data);
        
      } catch (err) {
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


  // Set up progress callback
  useEffect(() => {
    setProgressCallback((progressData) => {
      setUploadProgress(prev => {
        const existing = prev.find(p => p.photoId === progressData.photoId);
        if (existing) {
          return prev.map(p => 
            p.photoId === progressData.photoId 
              ? { ...p, progress: progressData.progress, status: progressData.status }
              : p
          );
        } else {
          return [...prev, {
            photoId: progressData.photoId,
            photoLabel: 'Photo',
            progress: progressData.progress,
            status: progressData.status,
            error: null
          }];
        }
      });
    });
  }, []);

  // Submit photos with real upload functionality
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
    setShowUploadProgress(true);
    setUploadProgress([]);

    try {
      // Start upload session
      await startUploadSession(quoteData.quoteId, locationId);

      // Prepare all photos for upload
      const allPhotos = [];
      
      // Add general photos
      quoteData.photos.general.forEach(photo => {
        allPhotos.push({
          photo,
          category: 'general',
          deviceInfo: null
        });
      });

      // Add device photos
      Object.entries(quoteData.photos.devices).forEach(([sku, slots]) => {
        slots.forEach((slot, slotIndex) => {
          slot.images.forEach(photo => {
            allPhotos.push({
              photo,
              category: 'device',
              deviceInfo: {
                sku,
                slotIndex
              }
            });
          });
        });
      });

      // Initialize progress tracking
      const initialProgress = allPhotos.map(({ photo }) => ({
        photoId: photo.id,
        photoLabel: photo.label || 'Photo',
        progress: 0,
        status: 'pending',
        error: null
      }));
      setUploadProgress(initialProgress);

      // Upload photos in batches
      const uploadResults = [];
      for (const { photo, category, deviceInfo } of allPhotos) {
        try {
          const result = await uploadPhotosBatch([photo], category, deviceInfo);
          // Persist category/deviceInfo for mapping later
          result.forEach(r => uploadResults.push({ ...r, category, deviceInfo }));
        } catch (error) {
          // Update progress to show failure
          setUploadProgress(prev => prev.map(p => 
            p.photoId === photo.id 
              ? { ...p, status: 'failed', error: error.message }
              : p
          ));
        }
      }

      // Build photo mappings (device photos grouped by item ID or name => urls)
      // Backend matches by itemKey (ID) first, then itemName
      const skuToItem = Object.fromEntries((quoteData.items || []).map(i => [i.sku, i]));
      const mapByKey = {};
      
      // Process device photos (with deviceInfo)
      uploadResults.filter(r => r.success && r.deviceInfo && r.result && (r.result.url || (r.result.result && r.result.result.url))).forEach(r => {
        const sku = r.deviceInfo.sku;
        const item = skuToItem[sku];
        if (!item) return; // Skip if item not found
        
        // Use item ID (itemKey) if available, otherwise use name (itemName)
        const key = item.id || item._id || item.name || sku;
        const url = r.result.url || r.result?.result?.url;
        if (!mapByKey[key]) {
          mapByKey[key] = {
            itemKey: item.id || item._id || undefined,
            itemName: item.name || sku,
            urls: []
          };
        }
        if (url) mapByKey[key].urls.push(url);
      });

      // Convert to array format expected by backend
      const uploads = Object.values(mapByKey).map(entry => ({
        itemKey: entry.itemKey,
        itemName: entry.itemName,
        urls: entry.urls
      }));

      // Send mappings and apply to estimate
      const session = getCurrentSession();
      
      if (uploads.length > 0) {
        try {
          const mapResult = await mapPhotosToEstimate(quoteData.quoteId, locationId || TEST_LOCATION_ID, session?.token, uploads);
          
          if (!mapResult.ok) {
            throw new Error('Failed to map photos: ' + (mapResult.error || 'Unknown error'));
          }
          
          // Note: token is optional for apply-photos, backend doesn't require it
          const applyResult = await applyPhotosToEstimate(quoteData.quoteId, locationId || TEST_LOCATION_ID, session?.token);
          
          if (!applyResult.ok) {
            throw new Error('Failed to apply photos: ' + (applyResult.error || 'Unknown error'));
          }
        } catch (error) {
          toast({
            title: "Warning",
            description: `Photos uploaded but may not have been applied to items: ${error.message}. Please refresh the quote page or try applying manually.`,
            variant: "default",
          });
        }
      }

      // Complete upload session (client-side cleanup)
      await completeUploadSession();

      // Check if all uploads were successful
      const failedUploads = uploadResults.filter(result => !result.success);
      if (failedUploads.length > 0) {
        toast({
          title: "Some uploads failed",
          description: `${failedUploads.length} photos failed to upload. You can retry them individually.`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Success message
      toast({
        title: "Photos submitted!",
        description: "Your photos have been submitted successfully. We'll review them and update your quote.",
      });

      // Wait a moment for backend to finish processing before redirecting
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to quote page
      const params = new URLSearchParams();
      if (quoteData.quoteId) params.append('estimateId', quoteData.quoteId);
      if (locationId) params.append('locationId', locationId);
      
      navigate(`/quote?${params.toString()}`);
      
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Failed to submit photos. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // Retry failed upload
  const handleRetryUpload = async (photoId) => {
    try {
      await retryUpload(photoId);
      toast({
        title: "Retrying upload",
        description: "Photo upload retry initiated.",
      });
    } catch (error) {
      toast({
        title: "Retry failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Cancel all uploads
  const handleCancelUploads = () => {
    cancelAllUploads();
    setShowUploadProgress(false);
    setUploadProgress([]);
    setIsSubmitting(false);
    toast({
      title: "Uploads cancelled",
      description: "All uploads have been cancelled.",
    });
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
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', paddingBottom: '200px' }}>
      {/* Quote Header */}
      <QuoteHeader quoteId={quoteData.quoteId} locationId={locationId} showPhotoButton={false} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
            {/* Helpful tip */}
            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #7dd3fc',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <Info style={{ width: '20px', height: '20px', color: '#0369a1', marginTop: '2px', flexShrink: 0 }} />
              <div style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
                <strong style={{ color: '#0369a1' }}>Tip:</strong> You can take photos directly from your phone's camera.
                Photos help us optimise your quote and installation time.
              </div>
            </div>

            {/* Upload Progress */}
            {showUploadProgress && (
              <UploadProgress
                uploads={uploadProgress}
                onRetry={handleRetryUpload}
                onCancel={handleCancelUploads}
              />
            )}

        {/* Location ID warning if missing */}
        {!locationId && (
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px'
          }}>
            <Info style={{ width: '20px', height: '20px', color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ color: '#111827', fontSize: '14px', fontWeight: '500' }}>
              No locationId found in your link. Proceeding with a default test location for this session.
            </div>
          </div>
        )}

        {/* Photo Upload Tabs */}
        <div style={{ width: '100%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#f3f4f6',
            borderRadius: '12px',
            padding: '4px',
            marginBottom: '24px'
          }}>
            <button
              onClick={() => setActiveTab('general')}
              style={{
                backgroundColor: activeTab === 'general' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === 'general' ? '#c95375' : '#6b7280',
                cursor: 'pointer',
                boxShadow: activeTab === 'general' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              General Site Photos
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              style={{
                backgroundColor: activeTab === 'devices' ? '#ffffff' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: activeTab === 'devices' ? '#c95375' : '#6b7280',
                cursor: 'pointer',
                boxShadow: activeTab === 'devices' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'
              }}
            >
              Device Locations
            </button>
          </div>

          {/* General Photos Tab */}
          {activeTab === 'general' && (
            <div style={{ marginTop: '24px' }}>
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}>
                <div style={{ padding: '32px 32px 24px 32px' }}>
                  <h2 style={{ 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: '#111827', 
                    margin: '0 0 8px 0' 
                  }}>
                    General Site Photos
                  </h2>
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    margin: '0',
                    fontWeight: '500'
                  }}>
                    Upload photos of your property and key areas
                  </p>
                </div>
                <div style={{ padding: '0 32px 32px 32px' }}>
                      {/* Photo Upload Component */}
                      <PhotoDropzone
                        photos={quoteData.photos.general}
                        onChange={(photos) => {
                          setQuoteData({
                            ...quoteData,
                            photos: { ...quoteData.photos, general: photos },
                          });
                        }}
                        uploadStatuses={uploadProgress.reduce((acc, upload) => {
                          acc[upload.photoId] = upload;
                          return acc;
                        }, {})}
                      />

                  {/* Photo Checklist */}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginTop: '24px' }}>
                    <h4 style={{ 
                      fontSize: '16px', 
                      fontWeight: '600', 
                      color: '#111827', 
                      margin: '0 0 16px 0' 
                    }}>
                      Suggested Photos
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {GENERAL_PHOTO_CHECKLIST.map((item) => {
                        // Check if we have a photo that matches this item
                        const hasPhoto = quoteData.photos.general.some((photo) =>
                          photo.label?.toLowerCase().includes(item.toLowerCase().split("/")[0])
                        );
                        
                        return (
                          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle2
                              style={{ 
                                width: '20px', 
                                height: '20px', 
                                color: hasPhoto ? '#10b981' : '#9ca3af' 
                              }}
                            />
                            <span style={{ 
                              fontSize: '14px', 
                              fontWeight: '500',
                              color: hasPhoto ? '#9ca3af' : '#111827',
                              textDecoration: hasPhoto ? 'line-through' : 'none'
                            }}>
                              {item}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Device Photos Tab */}
          {activeTab === 'devices' && (
            <div style={{ marginTop: '24px' }}>
              <DeviceSlots
                items={quoteData.items}
                devicePhotos={quoteData.photos.devices}
                onChange={(devices) => {
                  setQuoteData({
                    ...quoteData,
                    photos: { ...quoteData.photos, devices },
                  });
                }}
                uploadStatuses={uploadProgress.reduce((acc, upload) => {
                  acc[upload.photoId] = upload;
                  return acc;
                }, {})}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sticky Actions Bar */}
      <StickyActionsBar
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
