// Upload progress component for displaying real-time upload status
// Shows progress bars, status indicators, and retry options for failed uploads

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, AlertTriangle, Upload, Clock } from 'lucide-react';

// Upload progress component for individual photos
export function PhotoUploadProgress({ photoId, photoLabel, progress, status, error, onRetry }) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />;
      case 'failed':
        return <XCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />;
      case 'retrying':
        return <RotateCcw style={{ width: '16px', height: '16px', color: '#f59e0b', animation: 'spin 1s linear infinite' }} />;
      case 'uploading':
        return <Upload style={{ width: '16px', height: '16px', color: '#3b82f6' }} />;
      default:
        return <Clock style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed':
        return 'Uploaded';
      case 'failed':
        return 'Failed';
      case 'retrying':
        return 'Retrying...';
      case 'uploading':
        return `Uploading... ${progress}%`;
      default:
        return 'Pending';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'retrying':
        return '#f59e0b';
      case 'uploading':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      marginBottom: '8px'
    }}>
      {/* Status Icon */}
      <div style={{ flexShrink: 0 }}>
        {getStatusIcon()}
      </div>

      {/* Photo Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#111827',
          margin: '0 0 4px 0',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {photoLabel || 'Untitled Photo'}
        </p>
        
        {/* Progress Bar */}
        {status === 'uploading' && (
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#f3f4f6',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '4px'
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: '#3b82f6',
              transition: 'width 0.3s ease'
            }} />
          </div>
        )}

        {/* Status Text */}
        <p style={{
          fontSize: '12px',
          color: getStatusColor(),
          margin: '0',
          fontWeight: '500'
        }}>
          {getStatusText()}
        </p>

        {/* Error Message */}
        {status === 'failed' && error && (
          <p style={{
            fontSize: '11px',
            color: '#ef4444',
            margin: '4px 0 0 0',
            fontStyle: 'italic'
          }}>
            {error}
          </p>
        )}
      </div>

      {/* Retry Button */}
      {status === 'failed' && onRetry && (
        <button
          onClick={() => onRetry(photoId)}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
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
          <RotateCcw style={{ width: '12px', height: '12px' }} />
          Retry
        </button>
      )}
    </div>
  );
}

// Overall upload progress component
export function UploadProgress({ uploads = [], onRetry, onCancel }) {
  const [overallProgress, setOverallProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (uploads.length === 0) {
      setOverallProgress(0);
      setCompletedCount(0);
      setFailedCount(0);
      setIsUploading(false);
      return;
    }

    const completed = uploads.filter(upload => upload.status === 'completed').length;
    const failed = uploads.filter(upload => upload.status === 'failed').length;
    const uploading = uploads.filter(upload => upload.status === 'uploading').length;
    
    setCompletedCount(completed);
    setFailedCount(failed);
    setIsUploading(uploading > 0);

    // Calculate overall progress
    const totalProgress = uploads.reduce((sum, upload) => {
      if (upload.status === 'completed') return sum + 100;
      if (upload.status === 'uploading') return sum + (upload.progress || 0);
      return sum;
    }, 0);

    const averageProgress = uploads.length > 0 ? totalProgress / uploads.length : 0;
    setOverallProgress(Math.round(averageProgress));
  }, [uploads]);

  const getOverallStatus = () => {
    if (failedCount > 0) return 'error';
    if (completedCount === uploads.length && uploads.length > 0) return 'completed';
    if (isUploading) return 'uploading';
    return 'pending';
  };

  const getOverallStatusText = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'completed':
        return `All ${uploads.length} photos uploaded successfully`;
      case 'error':
        return `${completedCount} uploaded, ${failedCount} failed`;
      case 'uploading':
        return `Uploading... ${overallProgress}% complete`;
      default:
        return 'Ready to upload';
    }
  };

  const getOverallStatusColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'completed':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'uploading':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload style={{ width: '20px', height: '20px', color: '#6b7280' }} />
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#111827',
            margin: '0'
          }}>
            Upload Progress
          </h3>
        </div>

        {/* Cancel Button */}
        {isUploading && onCancel && (
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              color: '#ef4444',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#fef2f2';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#ffffff';
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Overall Progress */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '500',
            color: getOverallStatusColor()
          }}>
            {getOverallStatusText()}
          </span>
          <span style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            {completedCount}/{uploads.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#f3f4f6',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${overallProgress}%`,
            height: '100%',
            backgroundColor: getOverallStatusColor(),
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* Individual Uploads */}
      {uploads.length > 0 && (
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {uploads.map((upload) => (
            <PhotoUploadProgress
              key={upload.photoId}
              photoId={upload.photoId}
              photoLabel={upload.photoLabel}
              progress={upload.progress}
              status={upload.status}
              error={upload.error}
              onRetry={onRetry}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {uploads.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb',
          marginTop: '12px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>Total: {uploads.length}</span>
          <span>Completed: {completedCount}</span>
          <span>Failed: {failedCount}</span>
        </div>
      )}
    </div>
  );
}

// Upload status indicator for individual photos
export function UploadStatusIndicator({ status, size = 'small' }) {
  const iconSize = size === 'large' ? '20px' : '16px';
  
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle style={{ width: iconSize, height: iconSize, color: '#10b981' }} />;
      case 'failed':
        return <XCircle style={{ width: iconSize, height: iconSize, color: '#ef4444' }} />;
      case 'uploading':
        return <Upload style={{ width: iconSize, height: iconSize, color: '#3b82f6' }} />;
      case 'retrying':
        return <RotateCcw style={{ width: iconSize, height: iconSize, color: '#f59e0b' }} />;
      default:
        return <Clock style={{ width: iconSize, height: iconSize, color: '#6b7280' }} />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size === 'large' ? '32px' : '24px',
      height: size === 'large' ? '32px' : '24px',
      backgroundColor: '#f9fafb',
      borderRadius: '50%',
      border: '1px solid #e5e7eb'
    }}>
      {getIcon()}
    </div>
  );
}
