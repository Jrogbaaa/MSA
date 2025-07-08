'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, Home, Users, Mail, Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAdminAuth, logoutAdmin, getAdminSession } from '@/lib/adminAuth';
import PropertyManager from '@/components/admin/PropertyManager';
import DocumentManager from '@/components/admin/DocumentManager';


export default function AdminDashboardPage() {
  const { isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'applications' | 'documents' | 'activity'>('overview');
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isAdmin, isLoading, router]);

  // Load applications from localStorage
  useEffect(() => {
    const loadApplications = () => {
      try {
        const savedApplications = localStorage.getItem('msa_applications');
        if (savedApplications) {
          const parsedApplications = JSON.parse(savedApplications);
          setApplications(parsedApplications);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
      }
    };

    loadApplications();

    // Listen for storage changes (when new applications are submitted)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'msa_applications' && e.newValue) {
        try {
          const parsedApplications = JSON.parse(e.newValue);
          setApplications(parsedApplications);
        } catch (error) {
          console.error('Error parsing updated applications:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  const adminSession = getAdminSession();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-red-500" />
              <h1 className="text-xl font-bold">MSA Admin Panel</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Welcome, {adminSession?.username}
              </span>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('properties')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'properties'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Properties
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'applications'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Applications {applications.length > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {applications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'activity'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Total Properties</CardTitle>
                  <Home className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">4</div>
                  <p className="text-xs text-gray-400">Including Gold Street Studio</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Applications</CardTitle>
                  <Users className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{applications.length}</div>
                  <p className="text-xs text-gray-400">Pending review</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Messages</CardTitle>
                  <Mail className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">0</div>
                  <p className="text-xs text-gray-400">New inquiries</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">£7,325</div>
                  <p className="text-xs text-gray-400">Monthly potential</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Property Overview */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Home className="mr-2 h-5 w-5" />
                    Property Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-white">Gold Street Studio Flat</h3>
                      <span className="text-green-400 text-sm">Available</span>
                    </div>
                    <p className="text-gray-400 text-sm">Gold Street, Northampton, NN1 1RS</p>
                    <p className="text-white font-bold">£825/month</p>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => setActiveTab('properties')}
                  >
                    Manage Properties
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-8">
                      <p className="text-gray-400">No recent activity</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Activity will appear here as users interact with your properties
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {activeTab === 'properties' && (
          <PropertyManager />
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Property Applications</h2>
              <p className="text-gray-400">{applications.length} total applications</p>
            </div>

            {applications.length === 0 ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No Applications Yet</h3>
                  <p className="text-gray-400">Applications will appear here when users apply for properties.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((application, index) => (
                  <Card key={application.id || index} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Application Details */}
                        <div className="lg:col-span-2">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {application.applicantName}
                              </h3>
                              <p className="text-gray-400 text-sm">
                                Applied {new Date(application.submissionDate).toLocaleDateString('en-GB')} at {new Date(application.submissionDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              application.status === 'pending' 
                                ? 'bg-yellow-900 text-yellow-300 border border-yellow-700'
                                : application.status === 'approved'
                                ? 'bg-green-900 text-green-300 border border-green-700'
                                : 'bg-red-900 text-red-300 border border-red-700'
                            }`}>
                              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1) || 'Pending'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="text-white">{application.applicantEmail}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Phone</p>
                                <p className="text-white">{application.applicantPhone}</p>
                              </div>
                            </div>

                            {application.userId && (
                              <div>
                                <p className="text-gray-400 text-sm">User ID</p>
                                <p className="text-white text-xs font-mono">{application.userId}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Property Details */}
                        <div className="lg:col-span-1">
                          <div className="bg-gray-700 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-2">Property Details</h4>
                            <div className="space-y-2">
                              <div>
                                <p className="text-gray-400 text-sm">Property</p>
                                <p className="text-white text-sm">{application.propertyTitle}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Address</p>
                                <p className="text-white text-sm">{application.propertyAddress}</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Rent</p>
                                <p className="text-white font-semibold">£{application.propertyRent}/mo</p>
                              </div>
                              <div>
                                <p className="text-gray-400 text-sm">Property ID</p>
                                <p className="text-white text-xs font-mono">{application.propertyId}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-700">
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            const mailtoLink = `mailto:${application.applicantEmail}?subject=Re: Your Application for ${application.propertyTitle}&body=Hi ${application.applicantName},%0A%0AThank you for your interest in ${application.propertyTitle}.%0A%0A`;
                            window.open(mailtoLink, '_blank');
                          }}
                        >
                          <Mail className="h-4 w-4 mr-1" />
                          Email Applicant
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          onClick={() => {
                            const phoneNumber = application.applicantPhone.replace(/\D/g, '');
                            window.open(`tel:${phoneNumber}`, '_self');
                          }}
                        >
                          📞 Call {application.applicantPhone}
                        </Button>
                        <div className="flex-1"></div>
                        <p className="text-xs text-gray-500 self-center">
                          Application ID: {application.id}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
          <DocumentManager />
        )}

        {activeTab === 'activity' && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="mr-2 h-5 w-5" />
                Activity Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-400 mb-2">No activity to display</p>
                <p className="text-gray-500 text-sm">
                  User interactions, property applications, and system events will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="bg-gray-800 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/">
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  View Live Site
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => window.open('mailto:arnoldestates1@gmail.com')}
              >
                Check Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => alert('Coming soon: Export data functionality')}
              >
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Logged in as administrator since {adminSession?.loginTime && new Date(adminSession.loginTime).toLocaleString('en-GB')}
          </p>
        </div>
      </div>
    </div>
  );
} 