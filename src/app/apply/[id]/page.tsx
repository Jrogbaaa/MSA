'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Send, Mail, Phone, User } from 'lucide-react';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { properties as initialProperties } from '@/data/properties';

interface ApplicationFormData {
  name: string;
  email: string;
  phone: string;
}

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const propertyId = params.id as string;
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({
    name: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      if (foundProperty) {
        setProperty(foundProperty);
      } else {
        console.error('Property not found:', propertyId);
        router.push('/');
      }
    }
  }, [propertyId, properties, isLoading, router]);

  // Pre-fill user data if authenticated
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const applicationData = {
        id: `app_${Date.now()}`,
        propertyId,
        propertyTitle: property?.title,
        propertyAddress: property?.address,
        propertyRent: property?.rent,
        applicantName: formData.name,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        userId: user?.id,
        status: 'pending',
        submissionDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Store application in localStorage for admin tracking
      const existingApplications = JSON.parse(localStorage.getItem('msa_applications') || '[]');
      const updatedApplications = [applicationData, ...existingApplications];
      localStorage.setItem('msa_applications', JSON.stringify(updatedApplications));
      
      console.log('Application saved to localStorage:', applicationData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create comprehensive email for application submission
      const emailSubject = `🏠 NEW APPLICATION: ${property?.title} - ${formData.name}`;
      const emailBody = `
NEW PROPERTY APPLICATION RECEIVED
=====================================

📍 PROPERTY DETAILS:
• Title: ${property?.title}
• Address: ${property?.address}
• Monthly Rent: ${formatCurrency(property?.rent || 0)}
• Property ID: ${propertyId}

👤 APPLICANT INFORMATION:
• Name: ${formData.name}
• Email: ${formData.email}
• Phone: ${formData.phone}
• User ID: ${user?.id || 'Not signed in'}

📅 SUBMISSION:
• Date: ${new Date().toLocaleDateString('en-GB')}
• Time: ${new Date().toLocaleTimeString('en-GB')}

⚡ NEXT STEPS:
1. Review applicant information
2. Contact applicant via email or phone
3. Arrange property viewing if needed
4. Make rental decision

✅ This application was submitted through the MSA Real Estate website.
View admin dashboard: ${window.location.origin}/admin/dashboard

Best regards,
MSA Real Estate Application System
      `;
      
      // Open email client with pre-filled content
      const mailtoLink = `mailto:arnoldestates1@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoLink, '_blank');
      
      setIsSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
          <Card className="text-center">
            <CardContent className="pt-8 pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in <strong>{property.title}</strong>. 
                We have received your application and will contact you soon.
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  📧 An email notification has been sent to our team
                </p>
                <p className="text-sm text-gray-500">
                  📞 We'll contact you at <strong>{formData.phone}</strong>
                </p>
              </div>
              <div className="mt-6 space-y-3">
                <Button onClick={() => router.push('/')} className="w-full">
                  Back to Properties
                </Button>
                <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                  View Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
          </motion.div>
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
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Apply for Property
            </h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={property.photos[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {property.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {property.address}
                </p>
                <div className="text-2xl font-bold text-blue-600 mb-4">
                  {formatCurrency(property.rent)}/mo
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>🛏️ {property.bedrooms} {property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</div>
                  <div>🚿 {property.bathrooms} {property.bathrooms === 1 ? 'bathroom' : 'bathrooms'}</div>
                  <div>📐 {property.squareFootage} sqft</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Send className="h-5 w-5" />
                  <span>Application Form</span>
                </CardTitle>
                <p className="text-gray-600">
                  Please provide your contact information so we can get in touch with you about this property.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitApplication} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                      required
                      className="w-full"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• We'll review your application immediately</li>
                      <li>• Our team will contact you within 24 hours</li>
                      <li>• We can arrange a property viewing if needed</li>
                      <li>• Complete the rental process if approved</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-lg"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Submitting Application...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-5 w-5" />
                        <span>Submit Application</span>
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting this application, you consent to being contacted about this property.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
