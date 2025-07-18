'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Cloud, 
  CloudOff,
  Square,
  Shield,
  Truck,
  Home,
  RefreshCw,
  Upload,
  GripVertical
} from 'lucide-react';
import { StorageSpace } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { 
  getAllStorageSpaces, 
  subscribeToStorageSpaces,
  addStorageSpace,
  updateStorageSpace,
  deleteStorageSpace,
  resetToDefaultStorageSpaces,
  clearAllStorageSpacesData
} from '@/lib/storageSpaces';
import Image from 'next/image';

// Image Upload Component for Storage Spaces
interface ImageUploadProps {
  images: { id: string; src: string }[];
  onImagesChange: (images: { id: string; src: string }[]) => void;
}

const ImageUploadComponent: React.FC<ImageUploadProps> = ({ images, onImagesChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const compressImage = (file: File, targetSizeKB: number = 150, maxDimension: number = 1200): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          let { width, height } = img;
          
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

          let quality = 0.9;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          const checkSize = () => (dataUrl.length / 1024) * 0.75;

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
    
    if (images.length + files.length > 10) {
      alert(`Cannot upload ${files.length} image(s). Maximum 10 images allowed per storage space. You currently have ${images.length} image(s).`);
      setUploading(false);
      return;
    }
    
    const newImages: { id: string; src: string }[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not a supported image file.`);
        continue;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} is too large. Please use images under 10MB.`);
        continue;
      }

      try {
        const processedImageUrl = await compressImage(file, 120);
        newImages.push({ id: `img_${Date.now()}_${i}`, src: processedImageUrl });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        alert(`Failed to process ${file.name}. Please try again.`);
      }
    }
    
    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }
    setUploading(false);
  }, [images, onImagesChange]);

  const removeImage = (id: string) => {
    onImagesChange(images.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-600 bg-gray-700'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-gray-300">Processing images...</p>
          </div>
        ) : uploadSuccess ? (
          <div className="space-y-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-green-400">Images uploaded successfully!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="text-gray-300">Drag & drop images here, or click to select</p>
            <p className="text-xs text-gray-500">Max 10 images, up to 10MB each</p>
          </div>
        )}
      </div>

      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map(img => img.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image, index) => (
                <SortableImage key={image.id} image={image} index={index} onRemove={removeImage} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
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
      <img src={image.src} alt={`Storage space photo ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <Button
          size="icon"
          variant="destructive"
          className="absolute top-1 right-1 h-7 w-7"
          onClick={() => onRemove(image.id)}
        >
          <X className="h-3 w-3" />
        </Button>
        <div
          className="absolute bottom-1 left-1 cursor-move p-1 bg-white/20 rounded"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-3 w-3 text-white" />
        </div>
      </div>
      {index === 0 && (
        <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          Main
        </div>
      )}
    </div>
  );
};

export default function StorageSpaceManager() {
  const [storageSpaces, setStorageSpaces] = useState<StorageSpace[]>([]);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(true);
  const [isAddingStorageSpace, setIsAddingStorageSpace] = useState(false);
  const [editingStorageSpaceId, setEditingStorageSpaceId] = useState<string | null>(null);
  const [newStorageSpace, setNewStorageSpace] = useState<Partial<StorageSpace>>({
    title: '',
    size: '',
    squareFootage: 0,
    monthlyRate: 0,
    description: '',
    features: [],
    photos: [],
    availability: 'available',
    unitCount: 1
  });
  const [newStorageSpacePhotos, setNewStorageSpacePhotos] = useState<{ id: string; src: string }[]>([]);

  // Load storage spaces with real-time updates
  useEffect(() => {
    console.log('🔄 Setting up real-time storage spaces subscription for admin...');

    const unsubscribe = subscribeToStorageSpaces((updatedStorageSpaces) => {
      console.log(`📦 Admin storage spaces real-time update: ${updatedStorageSpaces.length} storage spaces`);
      setStorageSpaces(updatedStorageSpaces);
      setIsFirebaseConnected(true);
    });

    return () => {
      console.log('🧹 Cleaning up admin storage spaces subscription...');
      unsubscribe();
    };
  }, []);

  const handleAddStorageSpace = async () => {
    if (!newStorageSpace.title || !newStorageSpace.squareFootage || !newStorageSpace.monthlyRate) {
      alert('Please fill in all required fields (Title, Square Footage, and Weekly Rate)');
      return;
    }

    try {
      // Generate size automatically based on square footage
      const generateSize = (sqft: number) => {
        if (sqft <= 25) return '5x5 ft';
        if (sqft <= 50) return '5x10 ft';
        if (sqft <= 100) return '10x10 ft';
        if (sqft <= 200) return '10x20 ft';
        if (sqft <= 400) return '20x20 ft';
        return `${Math.ceil(Math.sqrt(sqft))}x${Math.ceil(Math.sqrt(sqft))} ft`;
      };

      await addStorageSpace({
        title: newStorageSpace.title!,
        size: generateSize(newStorageSpace.squareFootage || 0),
        squareFootage: newStorageSpace.squareFootage || 0,
        monthlyRate: newStorageSpace.monthlyRate || 0,
        description: newStorageSpace.description || '',
        features: newStorageSpace.features || [],
        photos: newStorageSpacePhotos.length > 0 ? newStorageSpacePhotos.map(p => p.src) : ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
        availability: newStorageSpace.availability || 'available',
        unitCount: newStorageSpace.unitCount || 1
      });

      // Reset form
      setNewStorageSpace({
        title: '',
        size: '',
        squareFootage: 0,
        monthlyRate: 0,
        description: '',
        features: [],
        photos: [],
        availability: 'available',
        unitCount: 1
      });
      setNewStorageSpacePhotos([]);
      setIsAddingStorageSpace(false);
      
      console.log('✅ Storage space added successfully');
    } catch (error) {
      console.error('❌ Error adding storage space:', error);
      alert('Error adding storage space. Please try again.');
    }
  };

  const handleUpdateStorageSpace = async (id: string, updates: Partial<StorageSpace>) => {
    try {
      await updateStorageSpace(id, updates);
      setEditingStorageSpaceId(null);
      console.log('✅ Storage space updated successfully');
    } catch (error) {
      console.error('❌ Error updating storage space:', error);
      alert('Error updating storage space. Please try again.');
    }
  };

  const handleDeleteStorageSpace = async (id: string) => {
    if (confirm('Are you sure you want to delete this storage space?')) {
      try {
        await deleteStorageSpace(id);
        console.log('✅ Storage space deleted successfully');
      } catch (error) {
        console.error('❌ Error deleting storage space:', error);
        alert('Error deleting storage space. Please try again.');
      }
    }
  };

  const resetToDefaultStorageSpaces = async () => {
    if (confirm('This will reset all storage spaces to default demo data. Are you sure?')) {
      try {
        await resetToDefaultStorageSpaces();
        console.log('✅ Storage spaces reset to default');
      } catch (error) {
        console.error('❌ Error resetting storage spaces:', error);
        alert('Error resetting storage spaces. Please try again.');
      }
    }
  };

  const clearAllData = async () => {
    if (confirm('⚠️ WARNING: This will DELETE ALL storage space data permanently. Are you absolutely sure?')) {
      if (confirm('This action cannot be undone. All storage space data will be lost forever. Continue?')) {
        try {
          await clearAllStorageSpacesData();
          console.log('✅ All storage space data cleared');
        } catch (error) {
          console.error('❌ Error clearing storage space data:', error);
          alert('Error clearing data. Please try again.');
        }
      }
    }
  };

  const handleFeatureAdd = (storageSpaceId: string | null, feature: string) => {
    if (storageSpaceId) {
      // Editing existing storage space
      const storageSpace = storageSpaces.find(s => s.id === storageSpaceId);
      if (storageSpace && feature && !storageSpace.features.includes(feature)) {
        handleUpdateStorageSpace(storageSpaceId, {
          features: [...storageSpace.features, feature]
        });
      }
    } else {
      // Adding to new storage space
      if (feature && !newStorageSpace.features?.includes(feature)) {
        setNewStorageSpace(prev => ({
          ...prev,
          features: [...(prev.features || []), feature]
        }));
      }
    }
  };

  const handleFeatureRemove = (storageSpaceId: string | null, featureIndex: number) => {
    if (storageSpaceId) {
      // Editing existing storage space
      const storageSpace = storageSpaces.find(s => s.id === storageSpaceId);
      if (storageSpace) {
        const updatedFeatures = storageSpace.features.filter((_, index) => index !== featureIndex);
        handleUpdateStorageSpace(storageSpaceId, { features: updatedFeatures });
      }
    } else {
      // Removing from new storage space
      setNewStorageSpace(prev => ({
        ...prev,
        features: prev.features?.filter((_, index) => index !== featureIndex) || []
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Package className="mr-2 h-6 w-6" />
          Storage Space Management
          {isFirebaseConnected ? (
            <Cloud className="ml-2 h-5 w-5 text-green-400" />
          ) : (
            <CloudOff className="ml-2 h-5 w-5 text-yellow-400" />
          )}
        </h2>
        <div className="flex space-x-3">
          <Button 
            onClick={() => setIsAddingStorageSpace(true)}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isAddingStorageSpace || editingStorageSpaceId !== null}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Storage Space
          </Button>
          <Button 
            onClick={resetToDefaultStorageSpaces}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            disabled={isAddingStorageSpace || editingStorageSpaceId !== null}
          >
            <Package className="mr-2 h-4 w-4" />
            Reset Demo
          </Button>
          <Button 
            onClick={clearAllData}
            variant="outline"
            className="border-red-600 text-red-400 hover:bg-red-900/50"
            disabled={isAddingStorageSpace || editingStorageSpaceId !== null}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Clear Storage
          </Button>
        </div>
      </div>

      {/* Storage Spaces Count and Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Storage Spaces</p>
                <p className="text-2xl font-bold text-white">{storageSpaces.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Available Units</p>
                <p className="text-2xl font-bold text-green-400">
                  {storageSpaces.reduce((total, space) => total + (space.availability === 'available' ? space.unitCount : 0), 0)}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(storageSpaces.reduce((total, space) => total + (space.monthlyRate * space.unitCount), 0))}/mo
                </p>
              </div>
              <Truck className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Storage Space Form */}
      {isAddingStorageSpace && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Add New Storage Space</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingStorageSpace(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newStorageSpace.title || ''}
                    onChange={(e) => setNewStorageSpace(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Small Storage Unit"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Weekly Rate *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newStorageSpace.monthlyRate || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewStorageSpace(prev => ({ ...prev, monthlyRate: value === '' ? 0 : parseFloat(value) || 0 }));
                    }}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="8.75"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Square Footage *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newStorageSpace.squareFootage || ''}
                    onChange={(e) => setNewStorageSpace(prev => ({ ...prev, squareFootage: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Unit Count
                  </label>
                  <input
                    type="number"
                    value={newStorageSpace.unitCount || ''}
                    onChange={(e) => setNewStorageSpace(prev => ({ ...prev, unitCount: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="1"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Availability
                  </label>
                  <select
                    value={newStorageSpace.availability || 'available'}
                    onChange={(e) => setNewStorageSpace(prev => ({ ...prev, availability: e.target.value as 'available' | 'occupied' | 'maintenance' }))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newStorageSpace.description || ''}
                  onChange={(e) => setNewStorageSpace(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Storage space description..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Features
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {newStorageSpace.features?.map((feature, index) => (
                    <span key={index} className="inline-flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      {feature}
                      <button
                        onClick={() => handleFeatureRemove(null, index)}
                        className="ml-2 text-blue-200 hover:text-white"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add feature"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        handleFeatureAdd(null, input.value);
                        input.value = '';
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input');
                      if (input?.value) {
                        handleFeatureAdd(null, input.value);
                        input.value = '';
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Photos */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Photos
                </label>
                <ImageUploadComponent
                  images={newStorageSpacePhotos}
                  onImagesChange={setNewStorageSpacePhotos}
                />
              </div>

              <div className="flex space-x-3">
                <Button onClick={handleAddStorageSpace} className="bg-green-600 hover:bg-green-700">
                  <Save className="mr-2 h-4 w-4" />
                  Save Storage Space
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingStorageSpace(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Storage Spaces List */}
      <div className="space-y-4">
        {storageSpaces.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-12 text-center">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No Storage Spaces</h3>
              <p className="text-gray-400 mb-4">Get started by adding your first storage space.</p>
              <Button 
                onClick={() => setIsAddingStorageSpace(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Storage Space
              </Button>
            </CardContent>
          </Card>
        ) : (
          storageSpaces.map((space) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-700">
                          {space.photos && space.photos.length > 0 ? (
                            <Image
                              src={space.photos[0]}
                              alt={space.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{space.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-300">
                            <span className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              {space.size}
                            </span>
                            <span>{space.squareFootage} sq ft</span>
                            <span className="text-blue-400 font-semibold">
                              {formatCurrency(space.monthlyRate)}/month
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              space.availability === 'available' ? 'bg-green-900 text-green-300' :
                              space.availability === 'occupied' ? 'bg-red-900 text-red-300' :
                              'bg-yellow-900 text-yellow-300'
                            }`}>
                              {space.unitCount} {space.availability === 'available' ? 'available' : space.availability}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">{space.description}</p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {space.features.map((feature, index) => (
                          <span key={index} className="inline-flex items-center bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
                            {feature === '24/7 Security' && <Shield className="h-3 w-3 mr-1" />}
                            {feature === 'Drive-up Access' && <Truck className="h-3 w-3 mr-1" />}
                            {feature === 'Climate Controlled' && <Package className="h-3 w-3 mr-1" />}
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingStorageSpaceId(space.id)}
                        disabled={editingStorageSpaceId !== null || isAddingStorageSpace}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteStorageSpace(space.id)}
                        disabled={editingStorageSpaceId !== null || isAddingStorageSpace}
                        className="border-red-600 text-red-400 hover:bg-red-900/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 