'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Home, MapPin, Bed, Bath, Square, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Property } from '@/types';
import { properties as initialProperties } from '@/data/properties';
import { formatCurrency } from '@/lib/utils';

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

export default function PropertyManager() {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PropertyFormData>(defaultFormData);
  const [amenitiesInput, setAmenitiesInput] = useState('');
  const [photosInput, setPhotosInput] = useState('');

  const resetForm = () => {
    setFormData(defaultFormData);
    setAmenitiesInput('');
    setPhotosInput('');
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
    setPhotosInput(property.photos.join(', '));
    setIsAddingProperty(false);
  };

  const handleDelete = (propertyId: string) => {
    if (window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      setProperties(properties.filter(p => p.id !== propertyId));
      
      // In a real app, this would make an API call to delete from database
      console.log(`Property ${propertyId} deleted`);
      alert('Property deleted successfully!');
    }
  };

  const handleSave = () => {
    // Parse amenities and photos from comma-separated strings
    const amenitiesList = amenitiesInput.split(',').map(item => item.trim()).filter(item => item.length > 0);
    const photosList = photosInput.split(',').map(item => item.trim()).filter(item => item.length > 0);

    const propertyData: Property = {
      ...formData,
      id: editingPropertyId || Date.now().toString(),
      amenities: amenitiesList,
      photos: photosList,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (editingPropertyId) {
      // Update existing property
      setProperties(properties.map(p => 
        p.id === editingPropertyId ? propertyData : p
      ));
      console.log('Property updated:', propertyData);
      alert('Property updated successfully!');
    } else {
      // Add new property
      setProperties([...properties, propertyData]);
      console.log('Property added:', propertyData);
      alert('Property added successfully!');
    }

    // Reset form and close modals
    resetForm();
    setIsAddingProperty(false);
    setEditingPropertyId(null);
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

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <Home className="mr-2 h-6 w-6" />
          Property Management
        </h2>
        <Button 
          onClick={() => setIsAddingProperty(true)}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isAddingProperty || editingPropertyId !== null}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Property
        </Button>
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
                    type="number"
                    value={formData.rent}
                    onChange={(e) => handleInputChange('rent', parseInt(e.target.value) || 0)}
                    placeholder="825"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
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
                  Photo URLs (comma-separated)
                </label>
                <Input
                  value={photosInput}
                  onChange={(e) => setPhotosInput(e.target.value)}
                  placeholder="e.g., /properties/1/main.jpg, /properties/1/1.jpg"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.title || !formData.address || formData.rent <= 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingPropertyId ? 'Update Property' : 'Add Property'}
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