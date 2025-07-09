'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Share2, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';
import { Property } from '@/types';
import { properties as initialProperties } from '@/data/properties';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatBedrooms, formatBathrooms } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load properties from Firebase with localStorage fallback
  useEffect(() => {
    const loadProperties = async () => {
      try {
        console.log('🔥 Loading properties from Firebase...');
        
        // Load all properties from Firebase
        const allProperties = await getAllProperties();
        setProperties(allProperties);
        
        console.log(`✅ Loaded ${allProperties.length} properties from Firebase`);
        
        // Set up real-time updates
        const unsubscribe = subscribeToProperties((updatedProperties) => {
          console.log(`🔄 Real-time update: ${updatedProperties.length} properties`);
          setProperties(updatedProperties);
        });
        
        setIsLoading(false);
        
        // Cleanup subscription on unmount
        return () => {
          unsubscribe();
        };
      } catch (error) {
        console.error('❌ Error loading properties from Firebase:', error);
        
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
        
        setIsLoading(false);
      }
    };

    loadProperties();

    // Also listen for storage changes as backup
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'msa_admin_properties' && e.newValue) {
        try {
          const parsedProperties = JSON.parse(e.newValue);
          const propertiesWithDates = parsedProperties.map((property: any) => ({
            ...property,
            createdAt: new Date(property.createdAt),
            updatedAt: new Date(property.updatedAt)
          }));
          setProperties(propertiesWithDates);
          console.log('Properties updated from localStorage - auto-refreshed');
        } catch (error) {
          console.error('Error parsing updated properties:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Find and set current property when properties are loaded
  useEffect(() => {
    if (!isLoading && properties.length > 0) {
      const foundProperty = properties.find(p => p.id === propertyId);
      setProperty(foundProperty || null);
    }
  }, [propertyId, properties, isLoading]);

  const handleNextImage = () => {
    if (property && currentImageIndex < property.photos.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleSaveProperty = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: property?.title,
        text: `Check out this amazing property: ${property?.title}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (!property) {
    if (isLoading) {
      // Loading state
      return (
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft size={20} className="mr-2" />
                    Back
                  </button>
                  <h1 className="text-xl font-semibold text-gray-900">Property Details</h1>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Loading Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <div className="animate-pulse">
                  <div className="h-64 md:h-96 bg-gray-200 rounded-lg"></div>
                  <div className="flex space-x-2 mt-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    ))}
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <div className="animate-pulse space-y-3">
                      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                      <div className="flex space-x-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-12 bg-gray-200 rounded"></div>
                      <div className="h-12 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Property not found (after loading is complete)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <MapPin size={48} className="mx-auto mb-4" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">
            The property you're looking for might have been removed or doesn't exist.
          </p>
          <div className="space-x-4">
            <Link href="/">
              <Button>View All Properties</Button>
            </Link>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Property Details</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProperty}
                className="flex items-center space-x-1"
              >
                <Heart 
                  size={16} 
                  className={isSaved ? 'text-red-500 fill-current' : 'text-gray-400'}
                />
                <span>Save</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-1"
              >
                <Share2 size={16} />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photos and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photo Gallery */}
            <div className="relative">
              <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                <Image
                  src={property.photos[currentImageIndex]}
                  alt={`${property.title} - Photo ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  className="object-cover"
                />
                
                {/* Navigation Arrows */}
                {property.photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 disabled:opacity-50"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextImage}
                      disabled={currentImageIndex === property.photos.length - 1}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 disabled:opacity-50"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                {/* Photo Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {property.photos.length}
                </div>
              </div>
              
              {/* Thumbnail Navigation */}
              {property.photos.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto">
                  {property.photos.map((photo, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ${
                        index === currentImageIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <Image
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{property.title}</CardTitle>
                <div className="flex items-center text-gray-600">
                  <MapPin size={18} className="mr-2" />
                  {property.address}
                </div>
                {/* Urgency Message */}
                {property.id === '1' && (
                  <div className="mt-3">
                    <span className="inline-flex items-center bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      🔥 Only 2 left! Act fast
                    </span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(property.rent)}
                    </div>
                    <div className="text-sm text-gray-500">per month</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bed size={20} className="mr-1" />
                      <span className="font-semibold">{formatBedrooms(property.bedrooms)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.bedrooms === 0 ? 'Flat' : property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bath size={20} className="mr-1" />
                      <span className="font-semibold">{formatBathrooms(property.bathrooms)}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Square size={20} className="mr-1" />
                      <span className="font-semibold">{property.squareFootage}</span>
                    </div>
                    <div className="text-sm text-gray-500">sq ft</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact and Apply */}
          <div className="space-y-6">
            {/* Application CTA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interested in this property?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/apply/${property.id}`}>
                  <Button className="w-full btn-touch">
                    Apply Now
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full btn-touch"
                  onClick={() => setShowContactForm(!showContactForm)}
                >
                  Schedule Tour
                </Button>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone size={16} className="mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail size={16} className="mr-2" />
                    Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            {showContactForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Schedule a Tour</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Preferred Time
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Select time</option>
                        <option value="morning">Morning (9AM - 12PM)</option>
                        <option value="afternoon">Afternoon (12PM - 5PM)</option>
                        <option value="evening">Evening (5PM - 8PM)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Message (Optional)
                      </label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any specific questions or requests?"
                      />
                    </div>
                    <Button className="w-full">
                      Request Tour
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Property Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type:</span>
                  <span className="font-medium">Apartment</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-medium text-green-600">
                    {property.availability === 'available' ? 'Now' : 'Not Available'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pet Policy:</span>
                  <span className="font-medium">
                    {property.amenities.includes('Pet Friendly') ? 'Pet Friendly' : 'No Pets'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parking:</span>
                  <span className="font-medium">
                    {property.amenities.includes('Parking') ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Laundry:</span>
                  <span className="font-medium">
                    {property.amenities.includes('Laundry') ? 'In Unit' : 'Shared'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 