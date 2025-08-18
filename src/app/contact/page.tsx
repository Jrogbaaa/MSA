'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { sendContactEmail, initEmailJS } from '@/lib/emailjs';
import { saveMessage } from '@/lib/messages';
import { testEmailJSConfiguration } from '@/lib/emailjs-test';


function ContactContent() {
  const searchParams = useSearchParams();
  const isArnoldContact = searchParams.get('to') === 'arnold';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Initialize EmailJS on component mount
  useEffect(() => {
    initEmailJS();
    // Test EmailJS configuration in development
    if (process.env.NODE_ENV === 'development') {
      testEmailJSConfiguration().then(result => {
        console.log('EmailJS Configuration Test:', result);
      }).catch(console.error);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Save message to Firestore
      await saveMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      // Try to send email directly via EmailJS
      const emailResult = await sendContactEmail({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        source: 'Contact Page'
      });

      if (emailResult.success) {
        // Email sent successfully via EmailJS
        setIsSubmitted(true);
        console.log('Email sent successfully via EmailJS');
      } else {
        // EmailJS failed, use mailto fallback
        console.log('EmailJS failed, using mailto fallback:', emailResult.error);
        
        const emailSubject = `MSA Contact: ${formData.subject}`;
        const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Message:
${formData.message}

Submitted: ${new Date().toLocaleString('en-GB')}
        `;
        
        const emailTo = isArnoldContact ? 'arnoldestates1@gmail.com' : 'arnoldestates1@gmail.com,11jellis@gmail.com';
        const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
        window.open(mailtoUrl, '_blank');
        
        setIsSubmitted(true);
        
        // Set appropriate message based on failure reason
        if (emailResult.fallbackReason === 'missing_config') {
          setSubmitError('Opening your email client to send the message. Please ensure it opens properly.');
        } else {
          setSubmitError('Email service temporarily unavailable. Opened your email client as backup.');
        }
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      
      // Still try to save message even if email fails
      await saveMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });
      
      // Fallback to mailto even on catch
      const emailSubject = `MSA Contact: ${formData.subject}`;
      const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Message:
${formData.message}

Submitted: ${new Date().toLocaleString('en-GB')}
      `;
      
      const emailTo = isArnoldContact ? 'arnoldestates1@gmail.com' : 'arnoldestates1@gmail.com,11jellis@gmail.com';
      const mailtoUrl = `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      window.open(mailtoUrl, '_blank');
      
      setIsSubmitted(true);
      setSubmitError('There was an issue with the email service. Your email client should have opened as a backup.');
    } finally {
      setIsSubmitting(false);
    }
    
    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setSubmitError(null);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-brand-200/20 rounded-full animate-float" />
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-200/20 rounded-full animate-float" style={{ animationDelay: '3s' }} />
      
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="MSA Real Estate" 
                width={600}
                height={180}
                className="h-40 w-auto"
                priority
              />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200 font-medium">
                Properties
              </Link>
              <Link href="/about" className="px-4 py-2 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200 font-medium">
                About
              </Link>
              <Link href="/contact" className="px-4 py-2 text-white bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg font-medium shadow-lg shadow-brand-500/25">
                Contact
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Hero Section */}
        <div className="text-center mb-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-6">
              {isArnoldContact ? (
                <>
                  <span className="block">Connect with</span>
                  <span className="block bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">Arnold Estates</span>
                </>
              ) : (
                <>
                  <span className="block">Get in Touch with</span>
                  <span className="block bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">MSA Real Estate</span>
                </>
              )}
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {isArnoldContact 
                ? 'Professional property management services, maintenance support, and tenant assistance - we\'re here to help.' 
                : 'Ready to find your dream property? We\'re here to guide you through every step of your property journey.'
              }
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Get In Touch</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">arnoldestates1@gmail.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">+44 7756 779811</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Service Area</p>
                    <p className="text-gray-600">Northampton & Surrounding Areas</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-gray-600">Within 24 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Send us a Message</CardTitle>
                <p className="text-gray-600">
                  {isArnoldContact 
                    ? 'Fill out the form below for property management assistance. Your message will be sent directly to Arnold Estates (arnoldestates1@gmail.com).'
                    : 'Fill out the form below and we\'ll get back to you promptly. Your message will be sent to our team.'
                  }
                </p>
              </CardHeader>
              <CardContent>
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600">
                        {submitError || 'Thank you for your message. We will get back to you soon!'}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="07xxx xxx xxx"
                        />
                      </div>
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-2">
                          Subject *
                        </label>
                        <Input
                          id="subject"
                          name="subject"
                          type="text"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="Property inquiry, viewing request, etc."
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us about your property requirements, ask questions, or schedule a viewing..."
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          <span>Send Message</span>
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    }>
      <ContactContent />
    </Suspense>
  );
} 