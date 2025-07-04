'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, FileText, Settings, CheckCircle, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Property, Application } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.svg" 
                  alt="MSA Real Estate" 
                  width={300}
                  height={80}
                  className="h-12 w-auto"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-2xl font-bold text-gray-900">0</div>
                        <div className="text-sm text-gray-500">Approved</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
