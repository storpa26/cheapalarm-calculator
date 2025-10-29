import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Textarea } from '../shared/ui/textarea';
import { PhotoDropzone } from './PhotoDropzone';
import { Camera, MapPin, FileText } from 'lucide-react';

// Device slots component for managing device-specific photo uploads
// Each device gets individual photo slots based on quantity
export function DeviceSlots({ items, devicePhotos, onChange, uploadStatuses = {} }) {
  // Update photos for a specific device slot
  const updateDevicePhotos = (sku, slotIndex, slotData) => {
    const updatedPhotos = { ...devicePhotos };
    
    if (!updatedPhotos[sku]) {
      updatedPhotos[sku] = [];
    }
    
    // Ensure we have enough slots for the quantity
    while (updatedPhotos[sku].length < items.find(item => item.sku === sku)?.qty || 0) {
      updatedPhotos[sku].push({ images: [], notes: '' });
    }
    
    updatedPhotos[sku][slotIndex] = slotData;
    onChange(updatedPhotos);
  };

  // Update notes for a specific device slot
  const updateSlotNotes = (sku, slotIndex, notes) => {
    const updatedPhotos = { ...devicePhotos };
    
    if (!updatedPhotos[sku]) {
      updatedPhotos[sku] = [];
    }
    
    // Ensure we have enough slots
    while (updatedPhotos[sku].length < items.find(item => item.sku === sku)?.qty || 0) {
      updatedPhotos[sku].push({ images: [], notes: '' });
    }
    
    updatedPhotos[sku][slotIndex] = {
      ...updatedPhotos[sku][slotIndex],
      notes: notes
    };
    
    onChange(updatedPhotos);
  };

  // Get device slots for an item
  const getDeviceSlots = (item) => {
    const slots = devicePhotos[item.sku] || [];
    const quantity = item.qty || 1;
    
    // Ensure we have the right number of slots
    while (slots.length < quantity) {
      slots.push({ images: [], notes: '' });
    }
    
    return slots.slice(0, quantity);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: '700', 
          color: '#111827', 
          margin: '0 0 8px 0' 
        }}>
          Device Location Photos
        </h2>
        <p style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          margin: '0',
          fontWeight: '500'
        }}>
          Upload photos for each device location to help us optimize your installation
        </p>
      </div>

      {/* Device Items */}
      {items.map((item) => {
        const slots = getDeviceSlots(item);
        
        return (
          <div key={item.sku} style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }}>
            <div style={{ 
              backgroundColor: '#f9fafb', 
              padding: '24px 32px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#111827', 
                margin: '0 0 4px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MapPin style={{ width: '20px', height: '20px', color: '#c95375' }} />
                {item.name}
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: '400', 
                  color: '#6b7280' 
                }}>
                  ({item.qty} {item.qty === 1 ? 'unit' : 'units'})
                </span>
              </h3>
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                margin: '0',
                fontWeight: '500'
              }}>
                {item.desc}
              </p>
            </div>
            
            <div style={{ padding: '24px 32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Device Slots */}
                {slots.map((slot, slotIndex) => (
                  <div key={slotIndex} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '20px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      marginBottom: '16px' 
                    }}>
                      <Camera style={{ width: '16px', height: '16px', color: '#6b7280' }} />
                      <h4 style={{ 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        color: '#111827',
                        margin: '0'
                      }}>
                        Location {slotIndex + 1}
                      </h4>
                      {slot.images.length > 0 && (
                        <span style={{
                          fontSize: '12px',
                          color: '#059669',
                          backgroundColor: '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {slot.images.length} photo{slot.images.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    
                    {/* Photo Upload for this slot */}
                    <PhotoDropzone
                      photos={slot.images}
                      onChange={(photos) => {
                        updateDevicePhotos(item.sku, slotIndex, {
                          ...slot,
                          images: photos
                        });
                      }}
                      compact={true}
                      uploadStatuses={uploadStatuses}
                    />
                    
                    {/* Notes for this slot */}
                    <div style={{ marginTop: '16px' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontSize: '12px', 
                        fontWeight: '600', 
                        color: '#374151', 
                        marginBottom: '8px' 
                      }}>
                        <FileText style={{ width: '16px', height: '16px' }} />
                        Installation Notes
                      </label>
                      <textarea
                        value={slot.notes}
                        onChange={(e) => updateSlotNotes(item.sku, slotIndex, e.target.value)}
                        placeholder="Add any specific notes about this device location..."
                        style={{
                          width: '100%',
                          minHeight: '80px',
                          padding: '12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontFamily: 'inherit',
                          resize: 'vertical',
                          outline: 'none'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#c95375';
                          e.target.style.boxShadow = '0 0 0 3px rgba(201, 83, 117, 0.1)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Help Text */}
      <div style={{
        backgroundColor: '#f0f9ff',
        border: '1px solid #7dd3fc',
        borderRadius: '12px',
        padding: '16px'
      }}>
        <h4 style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#0369a1', 
          margin: '0 0 8px 0' 
        }}>
          Photo Guidelines
        </h4>
        <ul style={{ 
          fontSize: '12px', 
          color: '#0369a1', 
          margin: '0',
          paddingLeft: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <li>• Take photos from the exact location where each device will be installed</li>
          <li>• Include surrounding area to show mounting options and cable access</li>
          <li>• Ensure good lighting and clear visibility of the installation area</li>
          <li>• Add notes about any special requirements or concerns</li>
        </ul>
      </div>
    </div>
  );
}
