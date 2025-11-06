import { useState, useRef } from 'react';
import { Button } from '../shared/ui/button';
import { Card, CardContent } from '../shared/ui/card';
import { Alert, AlertDescription } from '../shared/ui/alert';
import { Upload, X, Camera, AlertCircle } from 'lucide-react';
import { UploadStatusIndicator } from './UploadProgress';

// Photo dropzone component for uploading and managing photos
// Supports drag & drop, file selection, and camera capture
export function PhotoDropzone({ photos = [], onChange, compact = false, uploadStatuses = {} }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection from input
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    processFiles(fileArray);
  };

  // Process uploaded files and convert to data URLs
  const processFiles = async (files) => {
    setError('');
    
    try {
      const newPhotos = [];
      
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please select only image files.');
          continue;
        }
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('File size must be less than 10MB.');
          continue;
        }
        
        // Convert to data URL
        const dataUrl = await fileToDataUrl(file);
        
        // Create photo object
        const photo = {
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          dataUrl: dataUrl,
          label: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          notes: '',
        };
        
        newPhotos.push(photo);
      }
      
      // Update photos list
      if (newPhotos.length > 0) {
        onChange([...photos, ...newPhotos]);
      }
      
    } catch (err) {
      setError('Error processing files. Please try again.');
    }
  };

  // Convert file to data URL
  const fileToDataUrl = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle drag and drop events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  // Handle camera capture
  const handleCameraCapture = () => {
    // Create file input with camera capture attribute
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera on mobile
    input.onchange = (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files);
      }
    };
    input.click();
  };

  // Remove photo from list
  const removePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    onChange(updatedPhotos);
  };

  // Update photo label
  const updatePhotoLabel = (photoId, newLabel) => {
    const updatedPhotos = photos.map(photo => 
      photo.id === photoId ? { ...photo, label: newLabel } : photo
    );
    onChange(updatedPhotos);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Upload Area */}
      <div
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: '12px',
          padding: compact ? '24px 16px' : '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          backgroundColor: isDragOver ? '#f9fafb' : '#ffffff',
          borderColor: isDragOver ? '#c95375' : '#d1d5db',
          transition: 'all 0.2s ease-in-out'
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? '16px' : '24px' }}>
          <div style={{
            width: compact ? '48px' : '64px',
            height: compact ? '48px' : '64px',
            backgroundColor: '#f3f4f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Upload style={{ width: compact ? '24px' : '32px', height: compact ? '24px' : '32px', color: '#6b7280' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ 
              fontSize: compact ? '14px' : '18px', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '0' 
            }}>
              {compact ? 'Upload Photos' : 'Drag and drop images here'}
            </h3>
            <p style={{ 
              fontSize: compact ? '12px' : '14px', 
              color: '#6b7280', 
              margin: '0',
              fontWeight: '500'
            }}>
              {compact ? 'or click to browse' : 'or click to browse'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: compact ? '6px 12px' : '8px 16px',
                fontSize: compact ? '12px' : '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
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
              <Upload style={{ width: '14px', height: '14px' }} />
              Choose Files
            </button>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleCameraCapture();
              }}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: compact ? '6px 12px' : '8px 16px',
                fontSize: compact ? '12px' : '14px',
                fontWeight: '500',
                color: '#374151',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
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
              <Camera style={{ width: '14px', height: '14px' }} />
              Take Photo
            </button>
          </div>
          
          <p style={{ 
            fontSize: '10px', 
            color: '#6b7280', 
            margin: '0',
            fontWeight: '500'
          }}>
            Supports JPG, PNG, GIF. Max 10MB per file.
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: '0'
          }}>
            Uploaded Photos ({photos.length})
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                position: 'relative'
              }}>
                <div style={{ aspectRatio: '1 / 1', position: 'relative' }}>
                  <img
                    src={photo.dataUrl}
                    alt={photo.label || 'Uploaded photo'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* Upload Status Indicator */}
                  {uploadStatuses[photo.id] && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px'
                    }}>
                      <UploadStatusIndicator 
                        status={uploadStatuses[photo.id].status} 
                        size="large"
                      />
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                    onClick={() => removePhoto(photo.id)}
                  >
                    <X style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>

                {/* Photo label input */}
                <div style={{ padding: '16px' }}>
                  <input
                    type="text"
                    value={photo.label}
                    onChange={(e) => updatePhotoLabel(photo.id, e.target.value)}
                    placeholder="Photo label..."
                    style={{
                      width: '100%',
                      fontSize: '14px',
                      fontWeight: '500',
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none',
                      color: '#111827',
                      '::placeholder': { color: '#9ca3af' }
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
