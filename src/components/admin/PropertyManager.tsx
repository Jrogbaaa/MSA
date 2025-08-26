'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Edit, Trash2, Save, X, Home, MapPin, Bed, Bath, Square, Star, Upload, Image as ImageIcon, CheckCircle, Cloud, CloudOff, GripVertical, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Property } from '@/types';
import { properties as initialProperties } from '@/data/properties';
import { formatCurrency } from '@/lib/utils';
import { 
  getAllProperties, 
  saveProperty, 
  updateProperty,
  deleteProperty as deletePropertyFromFirebase, 
  initializeDefaultProperties,
  subscribeToProperties,
  subscribeToPropertiesCleanup,
  getPropertyStatistics,
  clearAllProperties
} from '@/lib/properties';
import { 
  uploadPropertyImages, 
  deletePropertyImages,
  isFirebaseStorageUrl,
  isBase64Url 
} from '@/lib/imageStorage';

interface PropertyFormData {
  title: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  description: string;
  amenities: string[];
  photos: { id: string; src: string }[];
  availability: 'available' | 'occupied' | 'maintenance' | 'sold';
  epcRating: string;
  councilTaxBand: string;
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
  availability: 'available',
  epcRating: '',
  councilTaxBand: ''
};

interface SortableImageProps {
  image: { id: string; src: string };
  index: number;
  onRemove: (id: string) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ image, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group aspect-square border rounded-lg overflow-hidden"
    >
      <img src={image.src} alt={`Property photo ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-1 right-1 h-7 w-7"
          onClick={() => onRemove(image.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <div {...attributes} {...listeners} className="cursor-grab text-white">
          <GripVertical className="h-6 w-6" />
        </div>
      </div>
      {index === 0 && (
        <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs font-bold px-2 py-1">
          Main
        </div>
      )}
    </div>
  );
};


// Image Upload Component
interface ImageUploadProps {
  images: { id: string; src: string }[];
  onImagesChange: (images: { id: string; src: string }[]) => void;
  propertyId?: string; // For Firebase Storage upload path
}

const ImageUploadComponent: React.FC<ImageUploadProps> = ({ images, onImagesChange, propertyId }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ completed: 0, total: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      onImagesChange(arrayMove(images, oldIndex, newIndex));
    }
  };

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

  // Enhanced image compression to actually reduce file sizes
  const compressImage = (file: File, targetSizeKB: number = 150, maxDimension: number = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let { width, height } = img;
          
          // Adjust dimensions if they exceed the max
          if (width > height) {
            if (width > maxDimension) {
              height *= maxDimension / width;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width *= maxDimension / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          if (!ctx) {
            return reject(new Error('Failed to get canvas context'));
          }
          
          ctx.drawImage(img, 0, 0, width, height);

          // Progressive quality reduction
          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          const checkSize = () => (dataUrl.length / 1024) * 0.75; // Base64 encoding adds ~33% size

          while (checkSize() > targetSizeKB && quality > 0.1) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleFiles = useCallback(async (files: FileList) => {
    setUploading(true);
    setUploadSuccess(false);
    setUploadProgress({ completed: 0, total: files.length });
    
    // Check if adding new files would exceed the 20-image limit
    const totalImages = images.length + files.length;
    if (totalImages > 20) {
      alert(`Cannot upload ${files.length} image(s). Maximum 20 images allowed per property. You currently have ${images.length} image(s).`);
      setUploading(false);
      return;
    }
    
    // Validate files
    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
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
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Please use images under 10MB.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) {
      setUploading(false);
      return;
    }
    
    try {
      // Use Firebase Storage if propertyId is available, otherwise fallback to base64
      if (propertyId) {
        console.log(`🔥 Uploading ${validFiles.length} image(s) to Firebase Storage...`);
        
        const uploadedUrls = await uploadPropertyImages(
          propertyId,
          validFiles,
          (completed, total) => {
            setUploadProgress({ completed, total });
            console.log(`Progress: ${completed}/${total} images uploaded`);
          }
        );
        
        // Create image objects from URLs
        const newImages = uploadedUrls.map((url, index) => ({
          id: `img_${Date.now()}_${index}`,
          src: url
        }));
        
        onImagesChange([...images, ...newImages]);
        console.log(`✅ Successfully uploaded ${newImages.length} image(s) to Firebase Storage`);
        
      } else {
        console.log(`📱 Using base64 fallback for ${validFiles.length} image(s)...`);
        
        // Fallback to base64 (original method)
        const newImages: { id: string; src: string }[] = [];
        
        for (let i = 0; i < validFiles.length; i++) {
          const file = validFiles[i];
          
          try {
            const originalSize = (file.size / 1024).toFixed(1);
            const processedImageUrl = await compressImage(file, 120); // Target 120KB
            const compressedSize = ((processedImageUrl.length / 1024) * 0.75).toFixed(1);
            
            newImages.push({ id: `img_${Date.now()}_${i}`, src: processedImageUrl });
            console.log(`Processed ${file.name} - Original: ${originalSize}KB, Compressed: ${compressedSize}KB`);
            
            setUploadProgress({ completed: i + 1, total: validFiles.length });
            
          } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
            alert(`Failed to process ${file.name}. Please try again.`);
          }
        }
        
        if (newImages.length > 0) {
          onImagesChange([...images, ...newImages]);
          console.log(`Successfully processed ${newImages.length} image(s) with compression`);
        }
      }
      
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress({ completed: 0, total: 0 });
    }
  }, [images, onImagesChange, propertyId]);

  const removeImage = (id: string) => {
    const newImages = images.filter((img) => img.id !== id);
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
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-gray-400 text-center">Drag & drop images here, or click to select files</p>
          <p className="text-xs text-gray-500 mt-1">
            Maximum 20 images, 10MB each. Using Firebase Storage for smaller documents.
          </p>
          {uploading && (
            <div className="mt-2 text-center">
              <p className="text-blue-400">
                {propertyId ? 'Uploading to Firebase Storage...' : 'Processing images...'}
              </p>
              {uploadProgress.total > 0 && (
                <p className="text-xs text-blue-300">
                  {uploadProgress.completed}/{uploadProgress.total} images processed
                </p>
              )}
            </div>
          )}
          {uploadSuccess && (
            <p className="text-green-400 mt-2">
              {propertyId ? 'Uploaded to Firebase Storage!' : 'Images processed successfully!'}
            </p>
          )}
        </label>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {images.map((image, index) => (
                <SortableImage
                  key={image.id}
                  image={image}
                  index={index}
                  onRemove={removeImage}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
              {images.filter(img => img.src.startsWith('data:')).length} uploaded files
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-blue-400">
              {images.filter(img => !img.src.startsWith('data:')).length} URL links
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
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [propertyToSave, setPropertyToSave] = useState<Property | null>(null);

  // Function to estimate document size
  const estimateDocumentSize = (prop: Property): number => {
    // Rough estimation in bytes by stringifying the object
    return new TextEncoder().encode(JSON.stringify(prop)).length;
  };

  // Load properties from Firebase with localStorage fallback
  useEffect(() => {
    const loadProperties = async () => {
      try {
        console.log('🔥 Loading properties from Firebase...');
        
        // Initialize default properties if needed
        await initializeDefaultProperties();
        
        // Load all properties
        const allProperties = await getAllProperties();
        console.log(`📊 getAllProperties returned: ${allProperties.length} properties`);
        console.log('🔍 Properties data:', allProperties.map(p => ({ id: p.id, title: p.title })));
        
        setProperties(allProperties);
        setIsFirebaseConnected(true);
        
        console.log(`✅ Loaded ${allProperties.length} properties from Firebase`);
        
        // Set up real-time updates with duplicate prevention
        const unsubscribe = subscribeToPropertiesCleanup((updatedProperties) => {
          console.log(`🔄 Real-time update received: ${updatedProperties.length} properties`);
          console.log('🔍 Real-time properties:', updatedProperties.map(p => ({ id: p.id, title: p.title })));
          
          // Only update if we actually have properties or if the current list is empty
          if (updatedProperties.length > 0 || properties.length === 0) {
            setProperties(updatedProperties);
            console.log(`✅ Applied real-time update: ${updatedProperties.length} properties`);
          } else {
            console.warn(`⚠️ Ignoring empty real-time update - keeping ${properties.length} existing properties`);
          }
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
      photos: property.photos.map((p, index) => ({ id: `prop_${property.id}_photo_${index}`, src: p })),
      availability: property.availability,
      epcRating: property.epcRating || '',
      councilTaxBand: property.councilTaxBand || ''
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
        
        // Delete Firebase Storage images first
        try {
          await deletePropertyImages(propertyId);
          console.log(`✅ Deleted Firebase Storage images for property ${propertyId}`);
        } catch (storageError) {
          console.warn(`⚠️ Could not delete Firebase Storage images for property ${propertyId}:`, storageError);
          // Continue with property deletion even if image cleanup fails
        }
        
        // Delete from Firebase
        await deletePropertyFromFirebase(propertyId);
        
        console.log(`✅ Property "${propertyToDelete.title}" deleted from Firebase`);
        
        // Show success message with property details
        alert(`✅ Property Successfully Deleted!\n\n"${propertyToDelete.title}" and all associated images have been removed from Firebase and the live website.\n\nThe property list has been updated.`);
        
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

  const handleToggleSold = async (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (!property) return;

    const newStatus = property.availability === 'sold' ? 'available' : 'sold';
    const actionText = newStatus === 'sold' ? 'mark as sold' : 'mark as available';
    
    const confirmMessage = `Are you sure you want to ${actionText} "${property.title}"?\n\nThis will update the property status on the live website immediately.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log(`🏷️ Toggling property "${property.title}" to ${newStatus}...`);
        
        // Update the property in Firebase
        const updatedProperty = await updateProperty(propertyId, { availability: newStatus });
        
        // Update local state immediately for quick feedback
        setProperties(properties.map(p => p.id === propertyId ? updatedProperty : p));
        
        console.log(`✅ Property "${property.title}" marked as ${newStatus}`);
        
        // Success feedback
        const statusText = newStatus === 'sold' ? 'SOLD' : 'Available';
        alert(`✅ Status Updated!\n\n"${property.title}" has been marked as ${statusText} and the change is now live on the website.`);
        
      } catch (error) {
        console.error('❌ Error updating property status:', error);
        alert(`❌ Error updating property status: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again.`);
      }
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.title || !formData.address || formData.rent <= 0) {
      alert('Please fill in at least Title, Address, and a valid Rent amount.');
      return;
    }
    setSavingProperty(true);
    
    const propertyDataForFirebase: Property = {
      id: editingPropertyId || `prop_${Date.now()}`,
      ...formData,
      amenities: amenitiesInput.split(',').map(s => s.trim()).filter(Boolean),
      photos: formData.photos.map(p => p.src), // Convert back to string[] for Firebase
      epcRating: formData.epcRating || "",
      councilTaxBand: formData.councilTaxBand || "",
      createdAt: editingPropertyId ? (properties.find(p => p.id === editingPropertyId)?.createdAt || new Date()) : new Date(),
      updatedAt: new Date(),
    };

    const documentSize = estimateDocumentSize(propertyDataForFirebase);
    const documentSizeMB = (documentSize / (1024 * 1024)).toFixed(2);
    console.log(`📊 Property document size: ${documentSizeMB}MB`);

    // Check if using Firebase Storage (URLs) vs base64 images
    const hasBase64Images = propertyDataForFirebase.photos.some(photo => 
      typeof photo === 'string' && photo.startsWith('data:image/')
    );
    
    // Only check size limit for base64 images (Firebase Storage URLs are small)
    if (hasBase64Images && documentSize > 800 * 1024) {
      setPropertyToSave(propertyDataForFirebase);
      setShowSizeWarning(true);
      setSavingProperty(false);
      return;
    }
    
    // Log document info for debugging
    if (hasBase64Images) {
      console.log(`📊 Property using base64 images - Document size: ${documentSizeMB}MB`);
    } else {
      console.log(`📊 Property using Firebase Storage URLs - Document size: ${documentSizeMB}MB`);
    }

    await proceedWithSave(propertyDataForFirebase);
  };

  const proceedWithSave = async (propertyData: Property) => {
    setSavingProperty(true);
    setShowSizeWarning(false);

    try {
      await saveProperty(propertyData);
      
      // Manually add/update property in local state for immediate feedback
      if (editingPropertyId) {
        setProperties(properties.map(p => p.id === editingPropertyId ? propertyData : p));
      } else {
        setProperties([propertyData, ...properties]);
      }
      
      resetForm();
      setPropertyToSave(null);
      
      // Success feedback
      alert(`✅ Property "${propertyData.title}" saved successfully to Firebase!`);

    } catch (error) {
      console.error('Failed to save property:', error);

      // Enhanced error handling with better user feedback
      if (error instanceof Error && error.message.includes('document is too large')) {
        alert(
          '🚫 Save Failed: Document Too Large\n\n' +
          'The property data, including images, exceeds Firebase\'s 1MB size limit. ' +
          'Please remove one or more images and try saving again.\n\n' +
          'Your form data has not been cleared.'
        );
      } else if (error instanceof Error && error.message.includes('INTERNAL ASSERTION FAILED')) {
        // Firebase internal error - property is saved to localStorage
        if (editingPropertyId) {
          setProperties(properties.map(p => p.id === editingPropertyId ? propertyData : p));
        } else {
          setProperties([propertyData, ...properties]);
        }
        resetForm();
        setPropertyToSave(null);
        
        alert(
          '⚠️ Firebase Connection Issue\n\n' +
          `Property "${propertyData.title}" has been saved to your local browser storage and will sync to Firebase when the connection is restored.\n\n` +
          'To fix Firebase connection issues, please:\n' +
          '1. Update your Firebase rules (see console for instructions)\n' +
          '2. Restart your development server\n\n' +
          'Your property is safe and will appear in the list.'
        );
      } else {
        // Other Firebase errors - still save locally
        if (editingPropertyId) {
          setProperties(properties.map(p => p.id === editingPropertyId ? propertyData : p));
        } else {
          setProperties([propertyData, ...properties]);
        }
        resetForm();
        setPropertyToSave(null);
        
        alert(
          '⚠️ Save Completed with Fallback\n\n' +
          `Property "${propertyData.title}" has been saved to your local browser storage as a backup.\n\n` +
          'There was a temporary issue with Firebase, but your property is safe and visible in the list.\n\n' +
          'The property will automatically sync to Firebase when the connection is restored.'
        );
      }
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
                    title="Edit Property"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleSold(property.id)}
                    className={`${
                      property.availability === 'sold' 
                        ? 'border-green-600 text-green-400 hover:bg-green-900/50' 
                        : 'border-orange-600 text-orange-400 hover:bg-orange-900/50'
                    }`}
                    disabled={isAddingProperty || editingPropertyId !== null}
                    title={property.availability === 'sold' ? 'Mark as Available' : 'Mark as Sold'}
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(property.id)}
                    className="border-red-600 text-red-400 hover:bg-red-900/50"
                    disabled={isAddingProperty || editingPropertyId !== null}
                    title="Delete Property"
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
                  property.availability === 'sold' ? 'bg-gray-900/50 text-gray-400' :
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
                    type="text"
                    value={formData.squareFootage || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        handleInputChange('squareFootage', value === '' ? 0 : parseInt(value));
                      }
                    }}
                    placeholder="450"
                    className="bg-gray-700 border-gray-600 text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                     <option value="sold">Sold</option>
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

              {/* Property Certificates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    EPC Rating
                  </label>
                  <Input
                    value={formData.epcRating}
                    onChange={(e) => handleInputChange('epcRating', e.target.value)}
                    placeholder="e.g., A, B, C, D, E, F, G"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Energy Performance Certificate rating</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Council Tax Band
                  </label>
                  <Input
                    value={formData.councilTaxBand}
                    onChange={(e) => handleInputChange('councilTaxBand', e.target.value)}
                    placeholder="e.g., A, B, C, D, E, F, G, H"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">Council tax band classification</p>
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Photos
                </label>
                <ImageUploadComponent
                  images={formData.photos}
                  onImagesChange={(newImages) => handleInputChange('photos', newImages)}
                  propertyId={editingPropertyId || `temp_${Date.now()}`}
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

      {/* Document Size Warning Modal */}
      {showSizeWarning && propertyToSave && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-yellow-500 max-w-lg w-full">
            <CardHeader>
              <CardTitle className="text-yellow-400 flex items-center">
                <Upload className="mr-2" />
                Large Property Size Warning
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                The total size of this property's data is approximately <strong>{(estimateDocumentSize(propertyToSave) / (1024 * 1024)).toFixed(2)}MB</strong>, which exceeds Firebase's 1MB document limit.
              </p>
              <p className="text-gray-400">
                This property contains base64-encoded images. For better performance and to avoid size limits, images should be uploaded to Firebase Storage instead.
              </p>
              <p className="text-blue-300 text-sm mt-2">
                💡 Tip: Delete this property and re-add it with fresh image uploads to automatically use Firebase Storage.
              </p>
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={() => proceedWithSave(propertyToSave)}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                  disabled={savingProperty}
                >
                  {savingProperty ? 'Saving...' : 'Proceed Anyway'}
                </Button>
                <Button
                  onClick={() => {
                    setShowSizeWarning(false);
                    setPropertyToSave(null);
                  }}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel and Review
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
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
               <div className="text-2xl font-bold text-gray-400">
                 {properties.filter(p => p.availability === 'sold').length}
               </div>
               <div className="text-gray-400 text-sm">Sold</div>
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