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
import { getAllProperties, subscribeToProperties } from '@/lib/properties';
import { sendContactEmail } from '@/lib/emailjs';
import { saveMessage } from '@/lib/messages';
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
  
  // Tour form state
  const [tourForm, setTourForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });
  const [isTourSubmitting, setIsTourSubmitting] = useState(false);
  const [tourSubmitted, setTourSubmitted] = useState(false);

  // Load properties from Firebase with localStorage fallback
  useEffect(() => {
    console.log(`🔄 Setting up real-time properties subscription for property page: ${propertyId}`);

    const unsubscribe = subscribeToProperties((updatedProperties) => {
      console.log(`🏠 PropertyPage real-time update: ${updatedProperties.length} properties`);
      setProperties(updatedProperties);
      
      // Once properties are loaded, find the specific one
      const foundProperty = updatedProperties.find(p => p.id === propertyId);
      setProperty(foundProperty || null);
      
      if (isLoading) {
        setIsLoading(false);
      }
    });

    return () => {
      console.log(`🧹 Cleaning up property page subscription for: ${propertyId}`);
      unsubscribe();
    };
  }, [propertyId]); // Dependency array includes propertyId to re-subscribe if the ID changes

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

  const handleTourFormChange = (field: keyof typeof tourForm, value: string) => {
    setTourForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTourSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tourForm.name || !tourForm.email || !tourForm.phone || !tourForm.date || !tourForm.time) {
      alert('Please fill in all required fields');
      return;
    }

    setIsTourSubmitting(true);

    try {
      // Save message to Firestore
      await saveMessage({
        name: tourForm.name,
        email: tourForm.email,
        phone: tourForm.phone,
        subject: `Property Tour Request - ${property?.title}`,
        message: `Property Tour Request for: ${property?.title}
Address: ${property?.address}
Rent: ${formatCurrency(property?.rent || 0)}

Preferred Date: ${tourForm.date}
Preferred Time: ${tourForm.time}

Additional Message: ${tourForm.message || 'None'}`,
      });

      // Try to send email directly via EmailJS
      const emailResult = await sendContactEmail({
        name: tourForm.name,
        email: tourForm.email,
        phone: tourForm.phone,
        subject: `🏠 Property Tour Request - ${property?.title}`,
        message: `Property Tour Request for: ${property?.title}
Address: ${property?.address}
Rent: ${formatCurrency(property?.rent || 0)}

Preferred Date: ${tourForm.date}
Preferred Time: ${tourForm.time}

Additional Message: ${tourForm.message || 'None'}

Contact Details:
- Name: ${tourForm.name}
- Email: ${tourForm.email}
- Phone: ${tourForm.phone}`,
        source: 'Property Tour Request'
      });

      if (emailResult.success) {
        console.log('✅ Tour request email sent successfully via EmailJS');
        setTourSubmitted(true);
      } else {
        console.log('⚠️ EmailJS failed, using mailto fallback:', emailResult.error);
        
        // Fallback to mailto with comprehensive details
        const emailSubject = `🏠 Property Tour Request - ${property?.title}`;
        const emailBody = `Property Tour Request

Property Details:
- Title: ${property?.title}
- Address: ${property?.address}
- Rent: ${formatCurrency(property?.rent || 0)}

Tour Request Details:
- Preferred Date: ${tourForm.date}
- Preferred Time: ${tourForm.time}
- Additional Message: ${tourForm.message || 'None'}

Contact Information:
- Name: ${tourForm.name}
- Email: ${tourForm.email}
- Phone: ${tourForm.phone}

Please contact the visitor to arrange the property viewing.`;
        
        const mailtoLink = `mailto:arnoldestates1@gmail.com,11jellis@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoLink, '_blank');
        
        setTourSubmitted(true);
      }
      
    } catch (error) {
      console.error('Error submitting tour request:', error);
      alert('There was an error submitting your tour request. Please try again.');
    } finally {
      setIsTourSubmitting(false);
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
              <div 
                className="relative h-64 md:h-96 rounded-lg overflow-hidden bg-gray-100 cursor-pointer group"
                onClick={() => {
                  // Open image in new tab for full view
                  window.open(property.photos[currentImageIndex], '_blank');
                }}
              >
                <Image
                  src={property.photos[currentImageIndex]}
                  alt={`${property.title} - Photo ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                  className="object-contain"
                  priority={currentImageIndex === 0}
                />
                {/* Click indicator overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                    <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                
                {/* Navigation Arrows */}
                {property.photos.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevImage();
                      }}
                      disabled={currentImageIndex === 0}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 disabled:opacity-50"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextImage();
                      }}
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
                        className="object-cover bg-gray-100"
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
                    {tourSubmitted ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Tour Request Sent!</h3>
                        <p className="text-gray-600 mb-4">
                          Thank you for your interest in {property?.title}. We'll contact you shortly to confirm your tour appointment.
                        </p>
                        <Button 
                          onClick={() => {
                            setTourSubmitted(false);
                            setShowContactForm(false);
                            setTourForm({ name: '', email: '', phone: '', date: '', time: '', message: '' });
                          }}
                          variant="outline"
                        >
                          Schedule Another Tour
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleTourSubmit}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              value={tourForm.name}
                              onChange={(e) => handleTourFormChange('name', e.target.value)}
                              placeholder="Enter your full name"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              value={tourForm.email}
                              onChange={(e) => handleTourFormChange('email', e.target.value)}
                              placeholder="Enter your email address"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Phone Number *
                            </label>
                            <input
                              type="tel"
                              value={tourForm.phone}
                              onChange={(e) => handleTourFormChange('phone', e.target.value)}
                              placeholder="Enter your phone number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                              Preferred Date *
                      </label>
                      <input
                        type="date"
                              value={tourForm.date}
                              onChange={(e) => handleTourFormChange('date', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                              Preferred Time *
                      </label>
                            <select 
                              value={tourForm.time}
                              onChange={(e) => handleTourFormChange('time', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
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
                              value={tourForm.message}
                              onChange={(e) => handleTourFormChange('message', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Any specific questions or requests?"
                      />
                    </div>
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={isTourSubmitting}
                          >
                            {isTourSubmitting ? 'Sending Request...' : 'Request Tour'}
                    </Button>
                        </div>
                      </form>
                    )}
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
                {property.epcRating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">EPC Rating:</span>
                    <span className="font-medium bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {property.epcRating}
                    </span>
                  </div>
                )}
                {property.councilTaxBand && (
                  <div className="flex justify-between">
                    <a 
                      href="https://www.westnorthants.gov.uk/council-tax-bands-and-charges/council-tax-charges"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                      title="Click to view West Northants Council Tax charges and band information"
                    >
                      Council Tax Band: ↗
                    </a>
                    <span className="font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {property.councilTaxBand}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 