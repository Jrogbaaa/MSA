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
import { getAllProperties, subscribeToProperties } from '@/lib/properties';
import { saveApplication } from '@/lib/applications';
import { sendApplicationEmail } from '@/lib/emailjs';

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
    console.log(`🔄 Setting up real-time properties subscription for apply page: ${propertyId}`);

    const unsubscribe = subscribeToProperties((updatedProperties) => {
      console.log(`🏠 ApplyPage real-time update: ${updatedProperties.length} properties`);
      setProperties(updatedProperties);
      
      const foundProperty = updatedProperties.find(p => p.id === propertyId);
      setProperty(foundProperty || null);
      
      if (isLoading) {
        setIsLoading(false);
      }
    });

    return () => {
      console.log(`🧹 Cleaning up apply page subscription for: ${propertyId}`);
      unsubscribe();
    };
  }, [propertyId]);

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
      if (!property) {
        throw new Error("Property details not loaded.");
      }

      // Save application to Firestore first
      const applicationResult = await saveApplication({
        propertyTitle: property.title,
        propertyAddress: property.address,
        applicantName: formData.name,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
      });
      
      console.log('Application saved to Firestore:', applicationResult);
      
      // Send email notification using EmailJS
      const emailResult = await sendApplicationEmail({
        propertyTitle: property.title,
        propertyAddress: property.address,
        propertyRent: property.rent,
        applicantName: formData.name,
        applicantEmail: formData.email,
        applicantPhone: formData.phone,
        userId: user?.id || 'guest-user',
        propertyId: propertyId as string,
      });

      if (emailResult.success) {
        console.log('✅ Email notification sent successfully via EmailJS');
        setIsSubmitted(true);
      } else {
        console.log('⚠️ EmailJS failed, using mailto fallback:', emailResult.error);
        
        // Fallback to mailto with comprehensive details
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
        const mailtoLink = `mailto:arnoldestates1@gmail.com,11jellis@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoLink, '_blank');
        
        setIsSubmitted(true);
      }
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-brand-200/20 rounded-full animate-float" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-green-200/20 rounded-full animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-all duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </Button>
            <h1 className="text-2xl font-display font-bold text-gray-900">
              Apply for Property
            </h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Modern Property Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-28 card-modern shadow-xl border-0">
              <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                <img
                  src={property.photos[0]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                    {property.title}
                  </h3>
                  <p className="text-gray-600 font-medium">
                    {property.address}
                  </p>
                </div>
                <div className="p-4 bg-gradient-to-br from-brand-50 to-blue-50 rounded-2xl">
                  <div className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                    {formatCurrency(property.rent)}/mo
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-green-50 rounded-xl">
                    <div className="text-lg font-bold text-green-700">{property.bedrooms}</div>
                    <div className="text-sm text-green-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-xl">
                    <div className="text-lg font-bold text-purple-700">{property.bathrooms}</div>
                    <div className="text-sm text-purple-600">Bathrooms</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Modern Application Form */}
          <div className="lg:col-span-2 relative z-10">
            <Card className="card-modern shadow-xl border-0">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl font-display font-bold text-gray-900 mb-4 flex items-center justify-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg shadow-brand-500/25">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <span>Application Form</span>
                </CardTitle>
                <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  Complete your application below. Our team will review your submission and respond within 24 hours.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitApplication} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg mr-3">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        Full Name *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                        required
                        className="input-modern h-14 text-lg w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg mr-3">
                          <Mail className="h-4 w-4 text-green-600" />
                        </div>
                        Email Address *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email address"
                        required
                        className="input-modern h-14 text-lg w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg mr-3">
                          <Phone className="h-4 w-4 text-purple-600" />
                        </div>
                        Phone Number *
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                        required
                        className="input-modern h-14 text-lg w-full"
                      />
                    </div>
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

                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-xl shadow-brand-500/25 transition-all duration-300"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Submitting Application...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <Send className="h-5 w-5" />
                          <span>Submit Application</span>
                        </div>
                      )}
                    </Button>
                  </div>

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
