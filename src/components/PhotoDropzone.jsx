import { useState, useRef } from 'react';
import { Button } from '../shared/ui/button';
import { Card, CardContent } from '../shared/ui/card';
import { Alert, AlertDescription } from '../shared/ui/alert';
import { Upload, X, Camera, AlertCircle } from 'lucide-react';

// Photo dropzone component for uploading and managing photos
// Supports drag & drop, file selection, and camera capture
export function PhotoDropzone({ photos = [], onChange }) {
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
      console.error('Error processing files:', err);
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
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 ease-in-out
          ${isDragOver 
            ? 'border-primary bg-primary/5 scale-[1.02] shadow-lg' 
            : 'border-border/40 hover:border-primary/60 hover:bg-muted/20'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-6">
          <div className="mx-auto w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-secondary" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Upload Photos
            </h3>
            <p className="text-base text-muted-foreground font-medium">
              Drag and drop images here, or click to select files
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium border-border/40 hover:border-primary/60 hover:text-primary transition-colors"
            >
              <Upload className="w-4 h-4" />
              Choose Files
            </Button>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleCameraCapture();
              }}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium border-border/40 hover:border-primary/60 hover:text-primary transition-colors"
            >
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground font-medium">
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
        <div className="space-y-6">
          <h4 className="text-lg font-semibold text-foreground">
            Uploaded Photos ({photos.length})
          </h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden border-border/40 shadow-card rounded-xl">
                <div className="aspect-square relative group">
                  <img
                    src={photo.dataUrl}
                    alt={photo.label || 'Uploaded photo'}
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  
                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Photo label input */}
                <div className="p-4">
                  <input
                    type="text"
                    value={photo.label}
                    onChange={(e) => updatePhotoLabel(photo.id, e.target.value)}
                    placeholder="Photo label..."
                    className="w-full text-sm font-medium border-0 bg-transparent focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
