import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../shared/ui/card';
import { Button } from '../shared/ui/button';
import { Textarea } from '../shared/ui/textarea';
import { PhotoDropzone } from './PhotoDropzone';
import { Camera, MapPin, FileText } from 'lucide-react';

// Device slots component for managing device-specific photo uploads
// Each device gets individual photo slots based on quantity
export function DeviceSlots({ items, devicePhotos, onChange }) {
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
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Device Location Photos
        </h2>
        <p className="text-gray-600">
          Upload photos for each device location to help us optimize your installation
        </p>
      </div>

      {/* Device Items */}
      {items.map((item) => {
        const slots = getDeviceSlots(item);
        
        return (
          <Card key={item.sku} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {item.name}
                <span className="text-sm font-normal text-gray-600">
                  ({item.qty} {item.qty === 1 ? 'unit' : 'units'})
                </span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {item.desc}
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Device Slots */}
                {slots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Camera className="w-4 h-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900">
                        Location {slotIndex + 1}
                      </h4>
                      {slot.images.length > 0 && (
                        <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
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
                    />
                    
                    {/* Notes for this slot */}
                    <div className="mt-4">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <FileText className="w-4 h-4" />
                        Installation Notes
                      </label>
                      <Textarea
                        value={slot.notes}
                        onChange={(e) => updateSlotNotes(item.sku, slotIndex, e.target.value)}
                        placeholder="Add any specific notes about this device location..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Photo Guidelines
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Take photos from the exact location where each device will be installed</li>
            <li>• Include surrounding area to show mounting options and cable access</li>
            <li>• Ensure good lighting and clear visibility of the installation area</li>
            <li>• Add notes about any special requirements or concerns</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
