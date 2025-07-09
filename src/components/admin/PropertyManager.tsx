'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, Home, MapPin, Bed, Bath, Square, Star, Upload, Image as ImageIcon, CheckCircle, Cloud, CloudOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Property } from '@/types';
import { properties as initialProperties } from '@/data/properties';
import { formatCurrency } from '@/lib/utils';
import { 
  getAllProperties, 
  saveProperty, 
  deleteProperty as deletePropertyFromFirebase, 
  initializeDefaultProperties,
  subscribeToProperties,
  getPropertyStatistics,
  clearAllProperties
} from '@/lib/properties';

interface PropertyFormData {
  title: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  description: string;
  amenities: string[];
  photos: string[];
  availability: 'available' | 'occupied' | 'maintenance';
}

const defaultFormData: PropertyFormData = {
  title: '',
  address: '',
  rent: 0,
  bedrooms: 0,
  bathrooms: 1,
  squareFootage: 0,
  description: '',
  amenities: [],
  photos: [],
  availability: 'available'
};

// Image Upload Component
interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
}

const ImageUploadComponent: React.FC<ImageUploadProps> = ({ images, onImagesChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  }, []);

  // Function to compress image to reduce localStorage usage
  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, newWidth, newHeight);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => reject(new Error('Image load error'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    setUploadSuccess(false);
    
    // Check if adding new files would exceed the 20-image limit
    const totalImages = images.length + files.length;
    if (totalImages > 20) {
      alert(`Cannot upload ${files.length} image(s). Maximum 20 images allowed per property. You currently have ${images.length} image(s).`);
      setUploading(false);
      return;
    }
    
    const newImages: string[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Enhanced file type validation - support HEIC and more formats
      const validImageTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/heic',
        'image/heif',
        'image/avif',
        'image/tiff',
        'image/bmp'
      ];
      
      const fileExtension = file.name.toLowerCase().split('.').pop();
      const isValidExtension = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'avif', 'tiff', 'bmp'].includes(fileExtension || '');
      
      if (!file.type.startsWith('image/') && !validImageTypes.includes(file.type) && !isValidExtension) {
        alert(`${file.name} is not a supported image file. Supported formats: JPG, PNG, GIF, WebP, HEIC, HEIF, AVIF, TIFF, BMP`);
        continue;
      }
      
      // Validate file size (10MB limit - increased for HEIC files which are larger)
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Please use images under 10MB.`);
        continue;
      }

      try {
        let processedImageUrl: string;
        
        // For HEIC files or very large images, convert to File first then compress
        if (file.type.includes('heic') || file.type.includes('heif') || file.size > 2 * 1024 * 1024) {
          console.log(`Compressing ${file.name} to reduce storage usage...`);
          processedImageUrl = await compressImage(file, 1200, 0.85);
        } else {
          // For smaller images, use direct base64 conversion
          processedImageUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              if (e.target?.result) {
                resolve(e.target.result as string);
              } else {
                reject(new Error('Failed to read file'));
              }
            };
            reader.onerror = () => reject(new Error('File reading error'));
            reader.readAsDataURL(file);
          });
        }
        
        // Add the processed image URL to the images array
        newImages.push(processedImageUrl);
        console.log(`Processed ${file.name} - Original: ${(file.size / 1024).toFixed(1)}KB, Compressed: ${(processedImageUrl.length / 1024).toFixed(1)}KB`);
        
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        alert(`Failed to process ${file.name}. Please try again.`);
      }
    }
    
    // IMPORTANT: Append new images to existing ones, don't replace
    onImagesChange([...images, ...newImages]);
    setUploading(false);
    
    if (newImages.length > 0) {
      console.log(`Successfully uploaded ${newImages.length} image(s) with compression`);
      setUploadSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    }
  }, [images, onImagesChange]);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Drag and Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragActive 
            ? 'border-blue-400 bg-blue-900/20' 
            : 'border-gray-600 bg-gray-700/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,.heic,.heif"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-white mb-2">
            Drop images here or click to upload
          </p>
          <p className="text-sm text-gray-400">
            Supports PNG, JPG, JPEG, HEIC, HEIF, WebP, AVIF up to 10MB each • Max 20 images per property
          </p>
          <p className="text-xs text-blue-400 mt-1">
            Images are automatically compressed to optimize storage space
          </p>
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400 mx-auto"></div>
              <p className="text-sm text-blue-400">Converting images to secure format...</p>
              <p className="text-xs text-gray-500">This may take a moment for larger images</p>
            </div>
          )}
          {uploadSuccess && (
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-2 text-green-400 text-sm">
                <CheckCircle className="h-5 w-5" />
                <span>Images successfully uploaded!</span>
              </div>
              <p className="text-xs text-green-300 mt-1">Ready to display on live website</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-700 rounded-lg overflow-hidden border border-gray-600">
                <img
                  src={image}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-200"
                  onLoad={(e) => {
                    // Image loaded successfully
                    const target = e.target as HTMLImageElement;
                    target.style.opacity = '1';
                  }}
                  onError={(e) => {
                    // Fallback for broken images
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23374151"/><text x="100" y="90" text-anchor="middle" fill="%239CA3AF" font-size="12" font-family="Arial">Image Error</text><text x="100" y="110" text-anchor="middle" fill="%236B7280" font-size="10" font-family="Arial">Failed to Load</text></svg>';
                    console.error('Failed to load image:', image.substring(0, 50) + '...');
                  }}
                  style={{ opacity: 0 }}
                />
                
                {/* Loading overlay for base64 images */}
                {image.startsWith('data:') && (
                  <div className="absolute inset-0 bg-gray-800/50 flex items-center justify-center opacity-0 transition-opacity">
                    <div className="text-center">
                      <div className="animate-pulse text-blue-400 text-xs">
                        Processing...
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              
              {index === 0 && (
                <div className="absolute bottom-2 left-2">
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-md">
                    Main Photo
                  </span>
                </div>
              )}
              
              {/* Image type indicator */}
              <div className="absolute top-2 left-2">
                <span className={`text-xs px-2 py-1 rounded shadow-md ${
                  image.startsWith('data:') 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-200'
                }`}>
                  {image.startsWith('data:') ? 'Uploaded' : 'URL'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Image Count and Status */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div>
          {images.length}/20 image{images.length !== 1 ? 's' : ''} uploaded
          {images.length > 0 && ' • First image will be used as main photo'}
        </div>
        {images.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-green-400">
              {images.filter(img => img.startsWith('data:')).length} uploaded files
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-blue-400">
              {images.filter(img => !img.startsWith('data:')).length} URL links
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function PropertyManager() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>(defaultFormData);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);

  // Load properties from Firebase with localStorage fallback
  useEffect(() => {
    const loadProperties = async () => {
      try {
        console.log('🔥 Loading properties from Firebase...');
        
        // Initialize default properties if needed
        await initializeDefaultProperties();
        
        // Load all properties
        const allProperties = await getAllProperties();
        setProperties(allProperties);
        setIsFirebaseConnected(true);
        
        console.log(`✅ Loaded ${allProperties.length} properties from Firebase`);
        
        // Set up real-time updates
        const unsubscribe = subscribeToProperties((updatedProperties) => {
          console.log(`🔄 Real-time update: ${updatedProperties.length} properties`);
          setProperties(updatedProperties);
        });
        
        // Cleanup subscription on unmount
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('❌ Error loading properties from Firebase:', error);
        setIsFirebaseConnected(false);
        
        // Fallback to localStorage
        try {
          const savedProperties = localStorage.getItem('msa_admin_properties');
          if (savedProperties) {
            const parsedProperties = JSON.parse(savedProperties);
            const propertiesWithDates = parsedProperties.map((property: any) => ({
              ...property,
              createdAt: new Date(property.createdAt),
              updatedAt: new Date(property.updatedAt)
            }));
            setProperties(propertiesWithDates);
            console.log(`📱 Loaded ${propertiesWithDates.length} properties from localStorage fallback`);
          } else {
            setProperties(initialProperties);
            console.log(`📦 Using ${initialProperties.length} default properties`);
          }
        } catch (storageError) {
          console.error('localStorage fallback error:', storageError);
          setProperties(initialProperties);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  // Function to get storage usage info
  const getStorageInfo = () => {
    const storage = localStorage.getItem('msa_admin_properties');
    const sizeInBytes = storage ? new Blob([storage]).size : 0;
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
    return { sizeInBytes, sizeInMB };
  };

  // Function to clear old data if storage is getting full
  const clearOldDataIfNeeded = () => {
    try {
      // Remove any old/unused keys
      const keysToRemove = ['msa_old_properties', 'msa_temp_data', 'msa_backup_properties'];
      keysToRemove.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
          console.log(`Removed old data: ${key}`);
        }
      });
    } catch (error) {
      console.error('Error clearing old data:', error);
    }
  };

  // Backup properties to localStorage for offline access
  useEffect(() => {
    if (!isLoading && properties.length > 0) {
      try {
        // Only backup to localStorage, don't rely on it as primary storage
        const dataToSave = JSON.stringify(properties);
        localStorage.setItem('msa_admin_properties', dataToSave);
        console.log(`💾 Backed up ${properties.length} properties to localStorage`);
      } catch (error) {
        console.warn('localStorage backup failed:', error);
        // Don't show errors for localStorage backup failures
      }
    }
  }, [properties, isLoading]);

  const resetForm = () => {
    setFormData(defaultFormData);
    setAmenitiesInput('');
  };

  const handleEdit = (property: Property) => {
    setEditingPropertyId(property.id);
    setFormData({
      title: property.title,
      address: property.address,
      rent: property.rent,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFootage: property.squareFootage,
      description: property.description,
      amenities: property.amenities,
      photos: property.photos,
      availability: property.availability
    });
    setAmenitiesInput(property.amenities.join(', '));
    setIsAddingProperty(false);
  };

  const handleDelete = async (propertyId: string) => {
    const propertyToDelete = properties.find(p => p.id === propertyId);
    if (!propertyToDelete) return;

    const confirmMessage = `Are you sure you want to delete "${propertyToDelete.title}"?\n\nThis action cannot be undone and will remove the property from the live website and Firebase.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log(`🗑️ Deleting property "${propertyToDelete.title}" (ID: ${propertyId})`);
        
        // Delete from Firebase
        await deletePropertyFromFirebase(propertyId);
        
        console.log(`✅ Property "${propertyToDelete.title}" deleted from Firebase`);
        
        // Show success message with property details
        alert(`✅ Property Successfully Deleted!\n\n"${propertyToDelete.title}" has been removed from Firebase and the live website.\n\nThe property list has been updated.`);
        
        // If we were editing this property, close the edit form
        if (editingPropertyId === propertyId) {
          handleCancel();
        }
      } catch (error) {
        console.error('❌ Error deleting property:', error);
        alert(`❌ Error deleting property: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
      }
    }
  };

  const handleSave = async () => {
    if (savingProperty) return; // Prevent double-saving
    
    try {
      setSavingProperty(true);
      console.log('🔄 Starting property save process...');
      console.log('Current form data:', formData);
      console.log('Current properties count:', properties.length);
      
      // Validate required fields
      if (!formData.title.trim()) {
        alert('❌ Property title is required!');
        return;
      }
      if (!formData.address.trim()) {
        alert('❌ Property address is required!');
        return;
      }
      if (formData.rent <= 0) {
        alert('❌ Monthly rent must be greater than £0!');
        return;
      }

      // Parse amenities from comma-separated strings
      const amenitiesList = amenitiesInput.split(',').map(item => item.trim()).filter(item => item.length > 0);

      const now = new Date();
      const propertyData: Property = {
        ...formData,
        id: editingPropertyId || `property_${now.getTime()}`, // Generate unique ID
        amenities: amenitiesList,
        photos: formData.photos,
        createdAt: editingPropertyId ? 
          properties.find(p => p.id === editingPropertyId)?.createdAt || now : 
          now,
        updatedAt: now
      };

      console.log('💾 Property data to save:', propertyData);
      console.log('📸 Number of photos:', propertyData.photos.length);

      // Save to Firebase
      await saveProperty(propertyData);
      
      console.log('✅ Property saved to Firebase successfully');
      
      if (editingPropertyId) {
        alert(`✅ Property Updated Successfully!\n\n"${propertyData.title}" has been updated and saved to Firebase.\n\nRent: £${propertyData.rent}/month\nLocation: ${propertyData.address}\n\nChanges are live on the website!`);
      } else {
        alert(`✅ Property Added Successfully!\n\n"${propertyData.title}" has been added to Firebase.\n\nRent: £${propertyData.rent}/month\nLocation: ${propertyData.address}\nProperty ID: ${propertyData.id}\n\nProperty is now live on the website!`);
      }

      // Reset form and close modals
      resetForm();
      setIsAddingProperty(false);
      setEditingPropertyId(null);
      
      console.log('🎉 Property save process completed successfully');
    } catch (error) {
      console.error('❌ Error saving property:', error);
      alert(`❌ Error saving property: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again. If the problem persists, the property may be saved locally but not synced to the live website.`);
    } finally {
      setSavingProperty(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsAddingProperty(false);
    setEditingPropertyId(null);
  };

  const handleInputChange = (field: keyof PropertyFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add function to reset to default properties (for admin use)
  const resetToDefaultProperties = async () => {
    const confirmMessage = `⚠️ RESET TO DEFAULT PROPERTIES\n\nThis will:\n• Delete ALL current properties from Firebase\n• Restore original demo properties\n• Cannot be undone\n\nAre you sure you want to continue?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log('🔄 Resetting to default properties...');
        
        // Clear all properties from Firebase
        await clearAllProperties();
        
        // Initialize default properties
        await initializeDefaultProperties();
        
        console.log('✅ Properties reset to defaults');
        alert('✅ Properties reset to defaults!\n\nAll custom properties have been removed from Firebase and demo properties restored.\n\nChanges are live on the website!');
        
        // Close any open forms
        handleCancel();
      } catch (error) {
        console.error('❌ Error resetting properties:', error);
        alert(`❌ Error resetting properties: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
      }
    }
  };

  // Function to clear all data from Firebase and localStorage
  const clearAllData = async () => {
    const confirmMessage = `⚠️ CLEAR ALL DATA\n\nThis will:\n• Delete ALL properties from Firebase\n• Delete ALL properties from browser storage\n• Free up storage space\n• Cannot be undone\n\nCurrent storage usage: ${getStorageInfo().sizeInMB}MB\n\nAre you sure you want to continue?`;
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log('🧹 Clearing all data...');
        
        // Clear from Firebase
        await clearAllProperties();
        
        // Clear from localStorage
        localStorage.removeItem('msa_admin_properties');
        localStorage.removeItem('msa_applications');
        localStorage.removeItem('msa_contact_messages');
        
        // Clear any other related data
        const keysToRemove = ['msa_old_properties', 'msa_temp_data', 'msa_backup_properties'];
        keysToRemove.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
          }
        });
        
        console.log('✅ All data cleared from Firebase and localStorage');
        alert('✅ All data cleared!\n\nAll properties have been removed from Firebase and the live website.\nStorage has been freed up and you can now add new properties.');
      } catch (error) {
        console.error('❌ Error clearing data:', error);
        alert(`❌ Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try refreshing the page.`);
      }
    }
  };



  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white">Loading properties...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Home className="mr-2 h-6 w-6" />
          Property Management
          {isFirebaseConnected ? (
            <Cloud className="ml-2 h-5 w-5 text-green-400" />
          ) : (
            <CloudOff className="ml-2 h-5 w-5 text-yellow-400" />
          )}
        </h2>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setIsAddingProperty(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isAddingProperty || editingPropertyId !== null}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Property
          </Button>
          <Button 
            onClick={resetToDefaultProperties}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={isAddingProperty || editingPropertyId !== null}
          >
            <Home className="mr-2 h-4 w-4" />
            Reset Demo
          </Button>
          <Button 
            onClick={clearAllData}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-900/50"
            disabled={isAddingProperty || editingPropertyId !== null}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Storage
          </Button>
        </div>
      </div>

      {/* Properties Count and Status */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>📊 Total Properties: <strong className="text-white">{properties.length}</strong></span>
          <div className="flex items-center space-x-4">
            {isFirebaseConnected ? (
              <span className="text-green-400">🔥 Connected to Firebase</span>
            ) : (
              <span className="text-yellow-400">📱 Using localStorage fallback</span>
            )}
            <span className="text-blue-400">📊 Storage: {getStorageInfo().sizeInMB}MB</span>
          </div>
        </div>
      </div>

      {/* Property List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">{property.title}</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(property)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    disabled={isAddingProperty || editingPropertyId !== null}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(property.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900/50"
                    disabled={isAddingProperty || editingPropertyId !== null}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">{property.address}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-white">
                  {formatCurrency(property.rent)}/month
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  property.availability === 'available' ? 'bg-green-900/50 text-green-400' :
                  property.availability === 'occupied' ? 'bg-red-900/50 text-red-400' :
                  'bg-yellow-900/50 text-yellow-400'
                }`}>
                  {property.availability.charAt(0).toUpperCase() + property.availability.slice(1)}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  <span>{property.bedrooms === 0 ? 'Studio' : `${property.bedrooms} bed`}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  <span>{property.bathrooms} bath</span>
                </div>
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  <span>{property.squareFootage} sqft</span>
                </div>
              </div>

              <p className="text-gray-400 text-sm line-clamp-2">
                {property.description}
              </p>

              <div className="flex flex-wrap gap-1">
                {property.amenities.slice(0, 3).map((amenity) => (
                  <span 
                    key={amenity}
                    className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
                  >
                    {amenity}
                  </span>
                ))}
                {property.amenities.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                    +{property.amenities.length - 3} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Property Form Modal */}
      {(isAddingProperty || editingPropertyId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>{editingPropertyId ? 'Edit Property' : 'Add New Property'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Property Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Modern Studio Flat"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monthly Rent (£) *
                  </label>
                  <Input
                    type="text"
                    value={formData.rent || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and empty string
                      if (value === '' || /^\d+$/.test(value)) {
                        handleInputChange('rent', value === '' ? 0 : parseInt(value));
                      }
                    }}
                    placeholder="825"
                    className="bg-gray-700 border-gray-600 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter monthly rent amount (numbers only)</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="e.g., Gold Street, Northampton, NN1 1RS"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bedrooms
                  </label>
                  <Input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => handleInputChange('bedrooms', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="bg-gray-700 border-gray-600 text-white"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bathrooms
                  </label>
                  <Input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => handleInputChange('bathrooms', parseInt(e.target.value) || 1)}
                    placeholder="1"
                    className="bg-gray-700 border-gray-600 text-white"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Square Feet
                  </label>
                  <Input
                    type="number"
                    value={formData.squareFootage}
                    onChange={(e) => handleInputChange('squareFootage', parseInt(e.target.value) || 0)}
                    placeholder="450"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                                         <option value="available">Available</option>
                     <option value="occupied">Occupied</option>
                     <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the property features, location benefits, etc."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amenities (comma-separated)
                </label>
                <Input
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="e.g., Gym, Parking, Pet Friendly, Balcony"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Photos
                </label>
                <ImageUploadComponent
                  images={formData.photos}
                  onImagesChange={(newImages) => handleInputChange('photos', newImages)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.title || !formData.address || formData.rent <= 0 || savingProperty}
                >
                  {savingProperty ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingPropertyId ? 'Update Property' : 'Add Property'}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Property Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{properties.length}</div>
              <div className="text-gray-400 text-sm">Total Properties</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {properties.filter(p => p.availability === 'available').length}
              </div>
              <div className="text-gray-400 text-sm">Available</div>
            </div>
                         <div>
               <div className="text-2xl font-bold text-red-400">
                 {properties.filter(p => p.availability === 'occupied').length}
               </div>
               <div className="text-gray-400 text-sm">Occupied</div>
             </div>
            <div>
              <div className="text-2xl font-bold text-white">
                £{properties.reduce((sum, p) => sum + p.rent, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">Total Potential Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 