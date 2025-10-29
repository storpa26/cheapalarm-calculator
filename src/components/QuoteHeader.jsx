import { useNavigate } from 'react-router-dom';
import { Button } from '../shared/ui/button';
import { Badge } from '../shared/ui/badge';
import { Camera, FileText } from 'lucide-react';

// Quote header component that displays quote information and action buttons
// Used across quote, upload, and thank-you pages for consistent navigation
export function QuoteHeader({ quoteId, locationId, showPhotoButton = true }) {
  const navigate = useNavigate();

  // Navigate to upload page with query parameters
  const handleUploadClick = (e) => {
    e.preventDefault();
    console.log('Upload button clicked');
    try {
      const params = new URLSearchParams();
      if (quoteId) params.append('estimateId', quoteId);
      if (locationId) params.append('locationId', locationId);
      const url = `/upload?${params.toString()}`;
      console.log('Navigating to:', url);
      navigate(url);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location
      const params = new URLSearchParams();
      if (quoteId) params.append('estimateId', quoteId);
      if (locationId) params.append('locationId', locationId);
      window.location.href = `/upload?${params.toString()}`;
    }
  };

  // Navigate to quote page with query parameters
  const handleQuoteClick = (e) => {
    e.preventDefault();
    console.log('Quote button clicked');
    try {
      const params = new URLSearchParams();
      if (quoteId) params.append('estimateId', quoteId);
      if (locationId) params.append('locationId', locationId);
      const url = `/quote?${params.toString()}`;
      console.log('Navigating to:', url);
      navigate(url);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location
      const params = new URLSearchParams();
      if (quoteId) params.append('estimateId', quoteId);
      if (locationId) params.append('locationId', locationId);
      window.location.href = `/quote?${params.toString()}`;
    }
  };

  return (
    <header className="bg-background border-b border-border/20">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Quote Information */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                Quote #{quoteId || 'N/A'}
              </h1>
              <p className="text-base text-muted-foreground mt-2 font-medium">
                Security System Installation
              </p>
            </div>
            
            {/* Status Badge */}
            <Badge className="bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium rounded-full border-0 shadow-sm">
              <FileText className="w-4 h-4 mr-2" />
              Estimate Created
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {/* View Quote Button */}
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleQuoteClick}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium border-border/40 hover:border-primary/40 hover:text-primary transition-colors"
            >
              <FileText className="w-4 h-4" />
              View Quote
            </Button>

            {/* Provide Photos Button - only show if enabled */}
            {showPhotoButton && (
              <Button 
                size="sm"
                onClick={handleUploadClick}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
              >
                <Camera className="w-4 h-4" />
                Provide Site Photos
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
