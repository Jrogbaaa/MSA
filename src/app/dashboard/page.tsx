'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, FileText, Settings, CheckCircle, User, Download, File } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Property, Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { 
  getUserDocuments, 
  downloadDocument, 
  getDocumentTypeDisplayName, 
  getStatusColorClass, 
  formatFileSize 
} from '@/lib/userDocuments';
import { TenantDocument } from '@/lib/firebaseAdmin';
import Link from 'next/link';
import Image from 'next/image';




export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userDocuments, setUserDocuments] = useState<TenantDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin?returnUrl=/dashboard');
    }
  }, [user, router]);

  // Load user documents from Firebase
  useEffect(() => {
    const loadDocuments = async () => {
      if (user?.id) {
        try {
          setDocumentsLoading(true);
          const documents = await getUserDocuments(user.id);
          setUserDocuments(documents);
        } catch (error) {
          console.error('Error loading user documents:', error);
        } finally {
          setDocumentsLoading(false);
        }
      }
    };

    loadDocuments();
  }, [user?.id]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-28">
            <div className="flex items-center space-x-4">
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
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.firstName}!
              </span>
              <Button onClick={signOut} variant="ghost" size="sm">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'overview'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <User size={16} />
                      <span>Overview</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'applications'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <FileText size={16} />
                      <span>Applications</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('saved')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'saved'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Heart size={16} />
                      <span>Saved Properties</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === 'documents'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <File size={16} />
                      <span>Documents</span>
                    </div>
                  </button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your applications and saved properties.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">1</div>
                        <div className="text-sm text-gray-500">Applications</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Heart className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">3</div>
                        <div className="text-sm text-gray-500">Saved Properties</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <File className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">{userDocuments.length}</div>
                        <div className="text-sm text-gray-500">Documents</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {userDocuments.filter(doc => doc.status === 'signed').length}
                        </div>
                        <div className="text-sm text-gray-500">Signed Documents</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500">No recent activity to display.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'documents' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Documents</CardTitle>
                    <p className="text-sm text-gray-600">
                      Access your lease agreements, insurance policies, and other tenant documents
                    </p>
                  </CardHeader>
                  <CardContent>
                    {documentsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading your documents...</p>
                      </div>
                    ) : userDocuments.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">No documents available</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Documents uploaded by your property manager will appear here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userDocuments.map((document) => (
                          <div key={document.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                <FileText className="h-8 w-8 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-sm font-medium text-gray-900">{document.fileName}</h3>
                                <p className="text-sm text-gray-500">
                                  {getDocumentTypeDisplayName(document.documentType)} • 
                                  Uploaded {document.uploadDate.toLocaleDateString('en-GB')} • 
                                  {formatFileSize(document.fileSize)}
                                </p>
                                {document.description && (
                                  <p className="text-xs text-gray-400">{document.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColorClass(document.status)}`}>
                                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadDocument(document)}
                              >
                                <Download size={14} className="mr-1" />
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === 'applications' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Your Applications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500">No applications to display.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'saved' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500">No saved properties to display.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
