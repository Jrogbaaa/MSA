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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-brand-600 hover:bg-brand-50 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back</span>
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-2xl font-display font-bold text-gray-900">Property Details</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveProperty}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  isSaved 
                    ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100' 
                    : 'border-gray-300 text-gray-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50'
                }`}
              >
                <Heart 
                  size={16} 
                  className={isSaved ? 'text-red-500 fill-current' : 'text-gray-400'}
                />
                <span className="font-medium">{isSaved ? 'Saved' : 'Save'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2 border-gray-300 text-gray-600 hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200"
              >
                <Share2 size={16} />
                <span className="font-medium">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Photos and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Modern Photo Gallery */}
            <div className="relative">
              <div 
                className="relative h-80 md:h-[500px] rounded-2xl overflow-hidden bg-gray-100 cursor-pointer group shadow-xl"
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

            {/* Modern Property Information */}
            <Card className="card-modern shadow-xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight">
                  {property.title}
                </CardTitle>
                <div className="flex items-center text-gray-600 text-lg">
                  <div className="p-2 bg-brand-50 rounded-lg mr-3">
                    <MapPin size={20} className="text-brand-600" />
                  </div>
                  {property.address}
                </div>
                {/* Enhanced Urgency Message */}
                {property.id === '1' && (
                  <div className="mt-4">
                    <div className="inline-flex items-center bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-red-500/25">
                      🔥 Only 2 left! Act fast
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl">
                    <div className="text-4xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent mb-2">
                      {formatCurrency(property.rent)}
                    </div>
                    <div className="text-gray-600 font-medium">per month</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-green-500 rounded-xl">
                        <Bed size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900 mb-1">{formatBedrooms(property.bedrooms)}</div>
                    <div className="text-gray-600 font-medium">
                      {property.bedrooms === 0 ? 'Studio Flat' : property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl">
                    <div className="flex items-center justify-center mb-3">
                      <div className="p-3 bg-purple-500 rounded-xl">
                        <Bath size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gray-900 mb-1">{formatBathrooms(property.bathrooms)}</div>
                    <div className="text-gray-600 font-medium">
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
            {/* Modern Application CTA */}
            <Card className="card-modern shadow-xl border-0">
              <CardHeader className="text-center pb-4">
                {property.availability === 'sold' ? (
                  <>
                    <CardTitle className="text-2xl font-display font-bold text-red-600 mb-2">Property Sold</CardTitle>
                    <p className="text-gray-600">This property has been sold</p>
                  </>
                ) : (
                  <>
                    <CardTitle className="text-2xl font-display font-bold text-gray-900 mb-2">Ready to Apply?</CardTitle>
                    <p className="text-gray-600">Take the next step towards your new home</p>
                  </>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {property.availability === 'sold' ? (
                  <>
                    <Button disabled className="w-full btn-touch bg-gray-400 text-white font-semibold text-lg py-4 cursor-not-allowed">
                      Property Sold
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full btn-touch border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-semibold py-4"
                      onClick={() => setShowContactForm(!showContactForm)}
                    >
                      <Mail className="mr-2 h-5 w-5" />
                      View Similar Properties
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href={`/apply/${property.id}`}>
                      <Button className="w-full btn-touch bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold text-lg py-4 shadow-xl shadow-brand-500/25">
                        Apply Now
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full btn-touch border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-semibold py-4"
                      onClick={() => setShowContactForm(!showContactForm)}
                    >
                      <Calendar className="mr-2 h-5 w-5" />
                      Schedule Tour
                    </Button>
                  </>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex items-center justify-center border-green-200 text-green-700 hover:bg-green-50 font-medium">
                    <Phone size={16} className="mr-2" />
                    Call
                  </Button>
                  <Button variant="outline" className="flex items-center justify-center border-blue-200 text-blue-700 hover:bg-blue-50 font-medium">
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

            {/* Modern Property Details */}
            <Card className="card-modern shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-xl font-display font-bold text-gray-900 flex items-center">
                  <div className="p-2 bg-brand-100 rounded-lg mr-3">
                    <Square size={20} className="text-brand-600" />
                  </div>
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">Property Type:</span>
                  <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">Apartment</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">Available:</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    property.availability === 'available' 
                      ? 'text-green-700 bg-green-100' 
                      : property.availability === 'sold'
                      ? 'text-red-700 bg-red-100'
                      : 'text-red-700 bg-red-100'
                  }`}>
                    {property.availability === 'available' ? 'Available Now' : 
                     property.availability === 'sold' ? 'SOLD' : 'Not Available'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">Pet Policy:</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    property.amenities.includes('Pet Friendly')
                      ? 'text-green-700 bg-green-100'
                      : 'text-gray-700 bg-gray-100'
                  }`}>
                    {property.amenities.includes('Pet Friendly') ? 'Pet Friendly' : 'No Pets'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">Parking:</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    property.amenities.includes('Parking')
                      ? 'text-blue-700 bg-blue-100'
                      : 'text-gray-700 bg-gray-100'
                  }`}>
                    {property.amenities.includes('Parking') ? 'Included' : 'Not Included'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                  <span className="text-gray-600 font-medium">Laundry:</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    property.amenities.includes('Laundry')
                      ? 'text-purple-700 bg-purple-100'
                      : 'text-gray-700 bg-gray-100'
                  }`}>
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