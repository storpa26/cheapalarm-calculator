// Upload API service for photo uploads with progress tracking and error handling
// Provides comprehensive upload functionality with retry, compression, and session management

// Upload session management
let currentSession = null;
let uploadQueue = [];
let isUploading = false;

// Upload configuration
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxConcurrentUploads: 3,
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  compressionQuality: 0.8,
  supportedFormats: ['image/jpeg', 'image/png', 'image/webp']
};

// Upload status types
export const UPLOAD_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  COMPLETED: 'completed',
  FAILED: 'failed',
  RETRYING: 'retrying'
};

// Upload progress callback type
let progressCallback = null;

/**
 * Initialize upload session
 * @param {string} estimateId - Quote/estimate ID
 * @param {string} locationId - Location ID
 * @returns {Promise<Object>} Session data
 */
export async function startUploadSession(estimateId, locationId) {
  try {
    console.log('Starting upload session for estimate:', estimateId);
    
    const response = await fetch('/wp-json/ca/v1/upload/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        estimateId,
        locationId,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to start upload session: ${response.status}`);
    }

    const sessionData = await response.json();
    currentSession = {
      id: sessionData.sessionId,
      estimateId,
      locationId,
      startTime: new Date(),
      status: 'active'
    };

    console.log('Upload session started:', currentSession.id);
    return currentSession;

  } catch (error) {
    console.error('Error starting upload session:', error);
    throw new Error(`Failed to start upload session: ${error.message}`);
  }
}

/**
 * Upload a single photo with progress tracking
 * @param {Object} photo - Photo object with dataUrl and metadata
 * @param {string} category - 'general' or 'device'
 * @param {Object} deviceInfo - Device info for device photos
 * @returns {Promise<Object>} Upload result
 */
export async function uploadPhoto(photo, category, deviceInfo = null) {
  if (!currentSession) {
    throw new Error('No active upload session. Call startUploadSession first.');
  }

  try {
    // Convert data URL to file
    const file = dataUrlToFile(photo.dataUrl, photo.label || 'photo.jpg');
    
    // Compress image if needed
    const compressedFile = await compressImage(file);
    
    // Validate file
    validateFile(compressedFile);

    // Create form data
    const formData = new FormData();
    formData.append('file', compressedFile);
    formData.append('sessionId', currentSession.id);
    formData.append('category', category);
    formData.append('photoId', photo.id);
    formData.append('label', photo.label || '');
    formData.append('notes', photo.notes || '');
    
    if (deviceInfo) {
      formData.append('deviceSku', deviceInfo.sku);
      formData.append('deviceSlot', deviceInfo.slotIndex);
    }

    // Upload with progress tracking
    const uploadResult = await uploadWithProgress(formData, photo.id);
    
    console.log('Photo uploaded successfully:', photo.id);
    return uploadResult;

  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

/**
 * Upload multiple photos in batch with progress tracking
 * @param {Array} photos - Array of photo objects
 * @param {string} category - 'general' or 'device'
 * @param {Object} deviceInfo - Device info for device photos
 * @returns {Promise<Array>} Upload results
 */
export async function uploadPhotosBatch(photos, category, deviceInfo = null) {
  if (!photos || photos.length === 0) {
    return [];
  }

  console.log(`Starting batch upload of ${photos.length} photos for ${category}`);
  
  const results = [];
  const uploadPromises = [];
  
  // Process photos in chunks to avoid overwhelming the server
  const chunks = chunkArray(photos, UPLOAD_CONFIG.maxConcurrentUploads);
  
  for (const chunk of chunks) {
    const chunkPromises = chunk.map(async (photo, index) => {
      try {
        const deviceInfoWithSlot = deviceInfo ? {
          ...deviceInfo,
          slotIndex: deviceInfo.slotIndex + index
        } : null;
        
        const result = await uploadPhoto(photo, category, deviceInfoWithSlot);
        results.push({ photo, result, success: true });
        return result;
      } catch (error) {
        console.error(`Failed to upload photo ${photo.id}:`, error);
        results.push({ photo, error, success: false });
        throw error;
      }
    });
    
    uploadPromises.push(...chunkPromises);
    
    // Wait for current chunk to complete before starting next
    await Promise.allSettled(chunkPromises);
  }

  return results;
}

/**
 * Upload with progress tracking using XMLHttpRequest
 * @param {FormData} formData - Form data to upload
 * @param {string} photoId - Photo ID for progress tracking
 * @returns {Promise<Object>} Upload result
 */
function uploadWithProgress(formData, photoId) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        updateProgress(photoId, progress, UPLOAD_STATUS.UPLOADING);
      }
    });
    
    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          updateProgress(photoId, 100, UPLOAD_STATUS.COMPLETED);
          resolve(result);
        } catch (error) {
          updateProgress(photoId, 0, UPLOAD_STATUS.FAILED);
          reject(new Error('Invalid response from server'));
        }
      } else {
        updateProgress(photoId, 0, UPLOAD_STATUS.FAILED);
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });
    
    // Handle errors
    xhr.addEventListener('error', () => {
      updateProgress(photoId, 0, UPLOAD_STATUS.FAILED);
      reject(new Error('Network error during upload'));
    });
    
    // Handle timeout
    xhr.addEventListener('timeout', () => {
      updateProgress(photoId, 0, UPLOAD_STATUS.FAILED);
      reject(new Error('Upload timeout'));
    });
    
    // Configure request
    xhr.open('POST', '/wp-json/ca/v1/upload/file');
    xhr.timeout = 30000; // 30 second timeout
    
    // Send request
    xhr.send(formData);
  });
}

/**
 * Complete upload session
 * @returns {Promise<Object>} Session completion result
 */
export async function completeUploadSession() {
  if (!currentSession) {
    throw new Error('No active upload session');
  }

  try {
    console.log('Completing upload session:', currentSession.id);
    
    const response = await fetch('/wp-json/ca/v1/upload/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: currentSession.id,
        estimateId: currentSession.estimateId,
        locationId: currentSession.locationId
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to complete upload session: ${response.status}`);
    }

    const result = await response.json();
    
    // Clear session
    currentSession = null;
    uploadQueue = [];
    isUploading = false;
    
    console.log('Upload session completed successfully');
    return result;

  } catch (error) {
    console.error('Error completing upload session:', error);
    throw error;
  }
}

/**
 * Retry failed upload
 * @param {string} photoId - Photo ID to retry
 * @returns {Promise<Object>} Upload result
 */
export async function retryUpload(photoId) {
  const failedPhoto = uploadQueue.find(item => item.photoId === photoId && item.status === UPLOAD_STATUS.FAILED);
  
  if (!failedPhoto) {
    throw new Error('Photo not found in failed uploads');
  }

  updateProgress(photoId, 0, UPLOAD_STATUS.RETRYING);
  
  try {
    const result = await uploadPhoto(failedPhoto.photo, failedPhoto.category, failedPhoto.deviceInfo);
    updateProgress(photoId, 100, UPLOAD_STATUS.COMPLETED);
    return result;
  } catch (error) {
    updateProgress(photoId, 0, UPLOAD_STATUS.FAILED);
    throw error;
  }
}

/**
 * Set progress callback for upload updates
 * @param {Function} callback - Progress callback function
 */
export function setProgressCallback(callback) {
  progressCallback = callback;
}

/**
 * Update upload progress
 * @param {string} photoId - Photo ID
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} status - Upload status
 */
function updateProgress(photoId, progress, status) {
  if (progressCallback) {
    progressCallback({
      photoId,
      progress,
      status,
      timestamp: new Date()
    });
  }
}

/**
 * Compress image file
 * @param {File} file - Image file to compress
 * @returns {Promise<File>} Compressed file
 */
async function compressImage(file) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1920px width)
      const maxWidth = 1920;
      const maxHeight = 1080;
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, file.type, UPLOAD_CONFIG.compressionQuality);
    };
    
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Validate file before upload
 * @param {File} file - File to validate
 */
function validateFile(file) {
  if (!UPLOAD_CONFIG.supportedFormats.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    throw new Error(`File too large: ${file.size} bytes (max: ${UPLOAD_CONFIG.maxFileSize})`);
  }
}

/**
 * Convert data URL to File object
 * @param {string} dataUrl - Data URL
 * @param {string} filename - Filename
 * @returns {File} File object
 */
function dataUrlToFile(dataUrl, filename) {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

/**
 * Split array into chunks
 * @param {Array} array - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get current upload session
 * @returns {Object|null} Current session or null
 */
export function getCurrentSession() {
  return currentSession;
}

/**
 * Check if currently uploading
 * @returns {boolean} Upload status
 */
export function isCurrentlyUploading() {
  return isUploading;
}

/**
 * Cancel all uploads
 */
export function cancelAllUploads() {
  uploadQueue = [];
  isUploading = false;
  if (currentSession) {
    currentSession.status = 'cancelled';
  }
}
