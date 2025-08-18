'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Phone,
  Mail,
  Square,
  Shield,
  Package,
  Truck,
  Heart,
  Share2
} from 'lucide-react';
import { StorageSpace } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { getAllStorageSpaces, subscribeToStorageSpaces } from '@/lib/storageSpaces';
import { sendContactEmail } from '@/lib/emailjs';
import { saveMessage } from '@/lib/messages';
import Image from 'next/image';
import Link from 'next/link';

export default function StorageSpaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storageSpaceId = params.id as string;
  
  const [storageSpaces, setStorageSpaces] = useState<StorageSpace[]>([]);
  const [storageSpace, setStorageSpace] = useState<StorageSpace | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Reservation form state
  const [reservationForm, setReservationForm] = useState({
    name: '',
    email: '',
    phone: '',
    moveInDate: '',
    duration: '',
    message: ''
  });
  const [isReservationSubmitting, setIsReservationSubmitting] = useState(false);
  const [reservationSubmitted, setReservationSubmitted] = useState(false);

  // Load storage spaces from Firebase with localStorage fallback
  useEffect(() => {
    console.log(`🔄 Setting up real-time storage spaces subscription for detail page: ${storageSpaceId}`);

    const unsubscribe = subscribeToStorageSpaces((updatedStorageSpaces) => {
      console.log(`📦 StorageSpacePage real-time update: ${updatedStorageSpaces.length} storage spaces`);
      setStorageSpaces(updatedStorageSpaces);
      
      // Once storage spaces are loaded, find the specific one
      const foundStorageSpace = updatedStorageSpaces.find(s => s.id === storageSpaceId);
      setStorageSpace(foundStorageSpace || null);
      
      if (isLoading) {
        setIsLoading(false);
      }
    });

    return () => {
      console.log(`🧹 Cleaning up storage space page subscription for: ${storageSpaceId}`);
      unsubscribe();
    };
  }, [storageSpaceId]);

  // Auto-open reservation form if 'reserve' query parameter is present
  useEffect(() => {
    const shouldOpenReservation = searchParams.get('reserve') === 'true';
    if (shouldOpenReservation) {
      setShowReservationForm(true);
    }
  }, [searchParams]);

  const handleNextImage = () => {
    if (storageSpace && currentImageIndex < storageSpace.photos.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleSaveStorageSpace = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: storageSpace?.title,
        text: `Check out this storage space: ${storageSpace?.title}`,
        url: window.location.href,
      });
    } catch (error) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReservationFormChange = (field: keyof typeof reservationForm, value: string) => {
    setReservationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reservationForm.name || !reservationForm.email || !reservationForm.phone || !reservationForm.moveInDate) {
      alert('Please fill in all required fields');
      return;
    }

    setIsReservationSubmitting(true);

    try {
      // Save message to Firestore
      await saveMessage({
        name: reservationForm.name,
        email: reservationForm.email,
        phone: reservationForm.phone,
        subject: `Storage Space Reservation - ${storageSpace?.title}`,
        message: `Storage Space Reservation Request for: ${storageSpace?.title}
Size: ${storageSpace?.size}
Monthly Rate: ${formatCurrency(storageSpace?.monthlyRate || 0)}

Move-in Date: ${reservationForm.moveInDate}
Duration: ${reservationForm.duration || 'Not specified'}

Additional Message: ${reservationForm.message || 'None'}`,
      });

      // Try to send email directly via EmailJS
      const emailResult = await sendContactEmail({
        name: reservationForm.name,
        email: reservationForm.email,
        phone: reservationForm.phone,
        subject: `📦 Storage Space Reservation - ${storageSpace?.title}`,
        message: `Storage Space Reservation Request for: ${storageSpace?.title}
Size: ${storageSpace?.size}
Monthly Rate: ${formatCurrency(storageSpace?.monthlyRate || 0)}

Move-in Date: ${reservationForm.moveInDate}
Duration: ${reservationForm.duration || 'Not specified'}

Additional Message: ${reservationForm.message || 'None'}

Contact Details:
- Name: ${reservationForm.name}
- Email: ${reservationForm.email}
- Phone: ${reservationForm.phone}`,
        source: 'Storage Space Reservation'
      });

      if (emailResult.success) {
        console.log('✅ Reservation email sent successfully via EmailJS');
        setReservationSubmitted(true);
      } else {
        console.log('⚠️ EmailJS failed, using mailto fallback:', emailResult.error);
        
        // Fallback to mailto with comprehensive details
        const emailSubject = `📦 Storage Space Reservation - ${storageSpace?.title}`;
        const emailBody = `Storage Space Reservation Request

Storage Space Details:
- Title: ${storageSpace?.title}
- Size: ${storageSpace?.size}
- Monthly Rate: ${formatCurrency(storageSpace?.monthlyRate || 0)}

Reservation Details:
- Move-in Date: ${reservationForm.moveInDate}
- Duration: ${reservationForm.duration || 'Not specified'}
- Additional Message: ${reservationForm.message || 'None'}

Contact Information:
- Name: ${reservationForm.name}
- Email: ${reservationForm.email}
- Phone: ${reservationForm.phone}

Please contact the customer to arrange the storage space reservation.`;
        
        const mailtoLink = `mailto:arnoldestates1@gmail.com,11jellis@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoLink, '_blank');
        
        setReservationSubmitted(true);
      }
      
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert('There was an error submitting your reservation. Please try again.');
    } finally {
      setIsReservationSubmitting(false);
    }
  };

  if (!storageSpace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading storage space details...</p>
            </>
          ) : (
            <>
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Storage Space Not Found</h2>
              <p className="text-gray-600 mb-4">The storage space you're looking for doesn't exist.</p>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
              <h1 className="text-xl font-semibold text-gray-900">Storage Space Details</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveStorageSpace}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center shadow-md" style={{ minHeight: '400px', maxHeight: '600px', height: '500px' }}>
              {storageSpace.photos && storageSpace.photos.length > 0 ? (
                <>
                  <Image
                    src={storageSpace.photos[currentImageIndex]}
                    alt={`${storageSpace.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-contain bg-white"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    priority={currentImageIndex === 0}
                  />
                  
                  {storageSpace.photos.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        disabled={currentImageIndex === 0}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={handleNextImage}
                        disabled={currentImageIndex === storageSpace.photos.length - 1}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  
                  {/* Image Counter */}
                  {storageSpace.photos.length > 1 && (
                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {storageSpace.photos.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Package className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Storage Space Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{storageSpace.title}</CardTitle>
                    <div className="flex items-center mt-2 text-gray-500">
                      <Square size={16} className="mr-1" />
                      <span className="text-lg">{storageSpace.size}</span>
                      <span className="mx-2">•</span>
                      <span className="text-lg">{storageSpace.squareFootage} sq ft</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {formatCurrency(storageSpace.monthlyRate)}
                    </div>
                    <div className="text-sm text-gray-500">per week</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-6">{storageSpace.description}</p>
                
                {/* Availability */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Availability</h3>
                  <div className="flex items-center space-x-4">
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {storageSpace.unitCount} units available
                    </div>
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {storageSpace.availability === 'available' ? 'Ready to move in' : storageSpace.availability}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Features & Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {storageSpace.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        {feature === '24/7 Security' && <Shield size={16} className="mr-2 text-green-500" />}
                        {feature === 'Drive-up Access' && <Truck size={16} className="mr-2 text-blue-500" />}
                        {feature === 'Climate Controlled' && <Package size={16} className="mr-2 text-purple-500" />}
                        {!['24/7 Security', 'Drive-up Access', 'Climate Controlled'].includes(feature) && (
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        )}
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reservation Form */}
          <div className="space-y-6">
            {/* Reservation CTA */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reserve this Storage Space</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full btn-touch"
                  onClick={() => setShowReservationForm(!showReservationForm)}
                >
                  <Package className="mr-2 h-4 w-4" />
                  Reserve Unit
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-green-50 hover:border-green-300"
                    onClick={() => {
                      window.open('tel:+447756779811', '_self');
                    }}
                    title="Call +44 7756 779811"
                  >
                    <Phone size={16} className="mr-2" />
                    Call
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => {
                      const subject = `Storage Space Inquiry - ${storageSpace?.title || 'Storage Unit'}`;
                      const body = `Hello,\n\nI am interested in the ${storageSpace?.title || 'storage unit'} (${storageSpace?.size || ''}) at ${storageSpace?.monthlyRate ? formatCurrency(storageSpace.monthlyRate) + '/week' : ''}.\n\nPlease contact me with more information.\n\nThank you!`;
                      window.open(`mailto:arnoldestates1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
                    }}
                    title="Email arnoldestates1@gmail.com"
                  >
                    <Mail size={16} className="mr-2" />
                    Email
                  </Button>
                </div>
                
                {/* Contact Information */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex items-center">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      <span>+44 7756 779811</span>
                    </div>
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      <span>arnoldestates1@gmail.com</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Form */}
            {showReservationForm && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Reserve Your Unit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reservationSubmitted ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Reservation Submitted!</h3>
                        <p className="text-gray-600 mb-4">
                          Thank you for your interest in {storageSpace?.title}. We'll contact you shortly to confirm your reservation.
                        </p>
                        <Button 
                          onClick={() => {
                            setReservationSubmitted(false);
                            setShowReservationForm(false);
                            setReservationForm({ name: '', email: '', phone: '', moveInDate: '', duration: '', message: '' });
                          }}
                          variant="outline"
                        >
                          Reserve Another Unit
                        </Button>
                      </div>
                    ) : (
                      <form onSubmit={handleReservationSubmit}>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Your Name *
                            </label>
                            <input
                              type="text"
                              value={reservationForm.name}
                              onChange={(e) => handleReservationFormChange('name', e.target.value)}
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
                              value={reservationForm.email}
                              onChange={(e) => handleReservationFormChange('email', e.target.value)}
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
                              value={reservationForm.phone}
                              onChange={(e) => handleReservationFormChange('phone', e.target.value)}
                              placeholder="Enter your phone number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Move-in Date *
                            </label>
                            <input
                              type="date"
                              value={reservationForm.moveInDate}
                              onChange={(e) => handleReservationFormChange('moveInDate', e.target.value)}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Storage Duration
                            </label>
                            <select 
                              value={reservationForm.duration}
                              onChange={(e) => handleReservationFormChange('duration', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select duration</option>
                              <option value="1-3 months">1-3 months</option>
                              <option value="3-6 months">3-6 months</option>
                              <option value="6-12 months">6-12 months</option>
                              <option value="1+ years">1+ years</option>
                              <option value="Undecided">Undecided</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Additional Information
                            </label>
                            <textarea
                              rows={3}
                              value={reservationForm.message}
                              onChange={(e) => handleReservationFormChange('message', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Any specific requirements or questions?"
                            />
                          </div>
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={isReservationSubmitting}
                          >
                            {isReservationSubmitting ? 'Submitting...' : 'Submit Reservation'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 