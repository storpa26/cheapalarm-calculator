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
    <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
          {/* Quote Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '700', 
                color: '#111827', 
                margin: '0',
                lineHeight: '1.2'
              }}>
                Quote #{quoteId || 'N/A'}
              </h1>
              <p style={{ 
                fontSize: '14px', 
                color: '#6b7280', 
                margin: '4px 0 0 0',
                fontWeight: '400'
              }}>
                Security System Installation
              </p>
            </div>
            
            {/* Status Badge */}
            <div style={{
              backgroundColor: '#288896',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <FileText style={{ width: '12px', height: '12px' }} />
              Estimate Created
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            {/* View Quote Button */}
            <button 
              onClick={handleQuoteClick}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = '#9ca3af';
                e.target.style.color = '#111827';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.color = '#374151';
              }}
            >
              <FileText style={{ width: '16px', height: '16px' }} />
              View Quote
            </button>

            {/* Provide Photos Button - only show if enabled */}
            {showPhotoButton && (
              <button 
                onClick={handleUploadClick}
                style={{
                  backgroundColor: '#c95375',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#b8456a';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#c95375';
                  e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                }}
              >
                <Camera style={{ width: '16px', height: '16px' }} />
                Provide Site Photos
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
