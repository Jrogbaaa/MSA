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

const mockProperty: Property = {
  id: '1',
  title: 'Modern Downtown Loft',
  address: '123 Main Street, Downtown',
  rent: 2500,
  bedrooms: 2,
  bathrooms: 2,
  squareFootage: 1200,
  description: 'Beautiful modern loft with city views',
  amenities: ['Gym', 'Rooftop Deck', 'Parking', 'Pet Friendly'],
  photos: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'],
  availability: 'available',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function ApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const propertyId = params.id as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [property, setProperty] = useState<Property | null>(null);
  const [formData, setFormData] = useState<ApplicationFormData>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setProperty(mockProperty);
  }, [propertyId]);

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

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
      };
      
      console.log('Submitting application:', applicationData);
      console.log('Application notification will be sent to: 11jellis@gmail.com');
      
      // Create email for application submission
      const emailSubject = `New Property Application: ${property?.title}`;
      const emailBody = `
NEW PROPERTY APPLICATION RECEIVED

Property Details:
- Title: ${property?.title}
- Address: ${property?.address}
- Rent: £${property?.rent}/month

Applicant Information:
- Name: ${formData.firstName || 'Not provided'} ${formData.lastName || 'Not provided'}
- Email: ${formData.email || 'Not provided'}
- Phone: ${formData.phone || 'Not provided'}

Application Details:
- User ID: ${user?.id}
- Property ID: ${propertyId}
- Submission Date: ${new Date().toLocaleString('en-GB')}

Please review this application and contact the applicant to arrange next steps.

Best regards,
MSA Real Estate Website
      `;
      
      const mailtoUrl = `mailto:11jellis@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Open email client
      window.open(mailtoUrl, '_blank');
      
      router.push('/dashboard?applicationSubmitted=true');
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!property || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
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
                    className={`flex items-center justify-center w-10 h-10 rounded-full $\{
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
                      className={`w-full h-1 mx-4 $\{
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
