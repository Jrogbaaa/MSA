'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, Upload, File, X, User, Briefcase, Users, FileText } from 'lucide-react';
import { Property } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { properties as initialProperties } from '@/data/properties';

interface ApplicationFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  employment?: string;
  references?: string;
  documents?: string[];
}

const steps = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Employment Details', icon: Briefcase },
  { id: 3, title: 'References', icon: Users },
  { id: 4, title: 'Documents', icon: FileText },
  { id: 5, title: 'Review & Submit', icon: Check },
];

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const propertyId = params.id as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load properties from localStorage (same system as admin panel and homepage)
  useEffect(() => {
    const loadProperties = () => {
      try {
        const savedProperties = localStorage.getItem('msa_admin_properties');
        if (savedProperties) {
          const parsedProperties = JSON.parse(savedProperties);
          // Convert date strings back to Date objects
          const propertiesWithDates = parsedProperties.map((property: any) => ({
            ...property,
            createdAt: new Date(property.createdAt),
            updatedAt: new Date(property.updatedAt)
          }));
          setProperties(propertiesWithDates);
          console.log(`Loaded ${propertiesWithDates.length} properties from localStorage`);
        } else {
          // First time loading - use initial data
          setProperties(initialProperties);
          console.log(`Using ${initialProperties.length} default properties`);
        }
      } catch (error) {
        console.error('Error loading properties from localStorage:', error);
        // Fallback to initial properties if localStorage fails
        setProperties(initialProperties);
      }
      setIsLoading(false);
    };

    loadProperties();

    // Listen for storage changes (when admin panel updates properties)
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
          console.log('Properties updated from admin panel - auto-refreshed');
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
        // Redirect to home if property not found
        router.push('/');
      }
    }
  }, [propertyId, properties, isLoading, router]);

  useEffect(() => {
    if (!user) {
      // Redirect to sign-in instead of homepage, with return URL
      router.push(`/auth/signin?returnUrl=/apply/${propertyId}`);
    }
  }, [user, router, propertyId]);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    
    try {
      const applicationData = {
        ...formData,
        documents: uploadedFiles,
        propertyId,
        userId: user?.id,
        propertyTitle: property?.title,
        propertyAddress: property?.address,
        propertyRent: property?.rent,
        submissionDate: new Date().toISOString(),
      };
      
      console.log('Submitting application:', applicationData);
      
      // Simulate processing time to show professional experience
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create comprehensive email for application submission
      const emailSubject = `🏠 NEW APPLICATION: ${property?.title} - ${formData.firstName} ${formData.lastName}`;
      const emailBody = `
NEW PROPERTY APPLICATION RECEIVED
=====================================

📍 PROPERTY DETAILS:
• Title: ${property?.title}
• Address: ${property?.address}  
• Monthly Rent: £${property?.rent}
• Property ID: ${propertyId}

👤 APPLICANT INFORMATION:
• Name: ${formData.firstName || 'Not provided'} ${formData.lastName || 'Not provided'}
• Email: ${formData.email || user?.email || 'Not provided'}
• Phone: ${formData.phone || 'Not provided'}
• User ID: ${user?.id}

💼 EMPLOYMENT & REFERENCES:
• Employment: ${formData.employment || 'Not provided'}
• References: ${formData.references || 'Not provided'}

📄 DOCUMENTS:
• Number of files uploaded: ${uploadedFiles.length}

📅 SUBMISSION:
• Date: ${new Date().toLocaleString('en-GB')}
• Time: ${new Date().toLocaleTimeString('en-GB')}

⚡ NEXT STEPS:
1. Review applicant information
2. Contact applicant via email or phone
3. Arrange property viewing if needed
4. Process application documents
5. Make rental decision

✅ This application was submitted through the MSA Real Estate website.

Best regards,
MSA Real Estate Application System
${window.location.origin}
      `;
      
      // Store application in localStorage for admin tracking
      const applications = JSON.parse(localStorage.getItem('msa_applications') || '[]');
      const newApplication = {
        id: `app_${Date.now()}`,
        ...applicationData,
        status: 'pending',
        submittedAt: new Date().toISOString()
      };
      applications.push(newApplication);
      localStorage.setItem('msa_applications', JSON.stringify(applications));
      
      console.log('Application saved to localStorage for admin tracking');
      
      // Open email client
      const mailtoUrl = `mailto:arnoldestates1@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Show success message first, then open email
      alert(`✅ Application Submitted Successfully!\n\nYour application for "${property?.title}" has been submitted.\n\nAn email will open to notify the property manager.\n\nYou'll be redirected to your dashboard.`);
      
      // Small delay then open email client
      setTimeout(() => {
        window.open(mailtoUrl, '_blank');
      }, 500);
      
      // Redirect to dashboard with success message
      router.push('/dashboard?applicationSubmitted=true');
      
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('❌ Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Loading Application...</h1>
          <p className="text-gray-600">Retrieving property details</p>
        </div>
      </div>
    );
  }

  if (!property || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {!user ? 'Authentication Required' : 'Property Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {!user 
              ? 'Please sign in to apply for this property' 
              : 'The property you\'re trying to apply for could not be found'}
          </p>
          <div className="space-x-4">
            <Button onClick={() => router.push('/')}>
              View All Properties
            </Button>
            {!user && (
              <Button variant="outline" onClick={() => router.push(`/auth/signin?returnUrl=/apply/${propertyId}`)}>
                Sign In
              </Button>
            )}
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
              <h1 className="text-xl font-semibold text-gray-900">Apply for Property</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Property Summary */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <img
                  src={property.photos[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{property.title}</h2>
                <p className="text-gray-600">{property.address}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">
                  {formatCurrency(property.rent)}/month
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-full h-1 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              {steps.find(s => s.id === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Personal Information Step */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <Input
                        defaultValue={user?.firstName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <Input
                        defaultValue={user?.lastName || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input
                        defaultValue={user?.email || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        type="email"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <Input
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        type="tel"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleNextStep} className="flex items-center space-x-2">
                      <span>Next</span>
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button for other steps */}
            {currentStep > 1 && (
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-600">
                    Step {currentStep} content would go here...
                  </p>
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handlePreviousStep}>
                      Previous
                    </Button>
                    {currentStep === steps.length ? (
                      <Button 
                        onClick={handleSubmitApplication} 
                        disabled={isSubmitting}
                        className="flex items-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <span>Submit Application</span>
                            <Check size={16} />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={handleNextStep} className="flex items-center space-x-2">
                        <span>Next</span>
                        <ArrowRight size={16} />
                      </Button>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
