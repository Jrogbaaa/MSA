'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, Home, Users, Mail, Settings, BarChart3, Database, RefreshCw, Loader2, Briefcase, FileText, MessageSquare, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useAdminAuth, logoutAdmin, getAdminSession } from '@/lib/adminAuth';
import PropertyManager from '@/components/admin/PropertyManager';
import DocumentManager from '@/components/admin/DocumentManager';
import TenantManager from '@/components/admin/TenantManager';
import ApplicationManager from '@/components/admin/ApplicationManager';
import MessageManager from '@/components/admin/MessageManager';
import StorageSpaceManager from '@/components/admin/StorageSpaceManager';
import { getFirebaseStatus, retryFirestoreConnection, testFirebasePermissions, db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { getAllProperties } from '@/lib/properties';
import { getUnreadMessagesCount } from '@/lib/messages';
import { getUnreadApplicationsCount } from '@/lib/applications';

// Fixed import issues for Vercel deployment

type AdminView = 'properties' | 'storage' | 'tenants' | 'documents' | 'applications' | 'messages';

export default function AdminDashboardPage() {
  const [activeView, setActiveView] = useState<AdminView>('properties');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadApplications, setUnreadApplications] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const session = getAdminSession();
    if (!session) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      loadNotificationCounts();
    }
  }, [router]);

  // Load notification counts and set up periodic refresh
  useEffect(() => {
    if (isAuthenticated) {
      loadNotificationCounts();
      
      // Refresh counts every 30 seconds
      const interval = setInterval(loadNotificationCounts, 30000);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadNotificationCounts = async () => {
    try {
      const [messagesCount, applicationsCount] = await Promise.all([
        getUnreadMessagesCount(),
        getUnreadApplicationsCount()
      ]);
      setUnreadMessages(messagesCount);
      setUnreadApplications(applicationsCount);
    } catch (error) {
      console.error('Error loading notification counts:', error);
    }
  };

  // Refresh counts when view changes
  const handleViewChange = (view: AdminView) => {
    setActiveView(view);
    // Refresh counts after a short delay to allow for any updates
    setTimeout(loadNotificationCounts, 1000);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeView) {
      case 'properties':
        return <PropertyManager />;
      case 'storage':
        return <StorageSpaceManager />;
      case 'tenants':
        return <TenantManager />;
      case 'documents':
        return <DocumentManager />;
      case 'applications':
        return <ApplicationManager />;
      case 'messages':
        return <MessageManager />;
      default:
        return <PropertyManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 p-6 min-h-screen">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <Button
              onClick={loadNotificationCounts}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
              title="Refresh notifications"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <nav className="space-y-4">
            <Button
              onClick={() => handleViewChange('properties')}
              variant={activeView === 'properties' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Home className="mr-2 h-4 w-4" /> Properties
            </Button>
            
            <Button
              onClick={() => handleViewChange('storage')}
              variant={activeView === 'storage' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Package className="mr-2 h-4 w-4" /> Storage Spaces
            </Button>
            
            <Button
              onClick={() => handleViewChange('applications')}
              variant={activeView === 'applications' ? 'secondary' : 'ghost'}
              className="w-full justify-start relative"
            >
              <Briefcase className="mr-2 h-4 w-4" /> Applications
              {unreadApplications > 0 && (
                <span className="absolute right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadApplications > 99 ? '99+' : unreadApplications}
                </span>
              )}
            </Button>
            
            <Button
              onClick={() => handleViewChange('messages')}
              variant={activeView === 'messages' ? 'secondary' : 'ghost'}
              className="w-full justify-start relative"
            >
              <MessageSquare className="mr-2 h-4 w-4" /> Messages
              {unreadMessages > 0 && (
                <span className="absolute right-3 bg-red-600 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </Button>
            
            <Button
              onClick={() => handleViewChange('tenants')}
              variant={activeView === 'tenants' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" /> Tenants
            </Button>
            
            <Button
              onClick={() => handleViewChange('documents')}
              variant={activeView === 'documents' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <FileText className="mr-2 h-4 w-4" /> Documents
            </Button>
          </nav>

          {/* Notification Summary */}
          {(unreadMessages > 0 || unreadApplications > 0) && (
            <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Notifications</h3>
              <div className="space-y-2">
                {unreadApplications > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">New Applications</span>
                    <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                      {unreadApplications}
                    </span>
                  </div>
                )}
                {unreadMessages > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">New Messages</span>
                    <span className="bg-red-600 text-white px-2 py-1 rounded-full text-xs">
                      {unreadMessages}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logout Button */}
          <div className="mt-8 pt-4 border-t border-gray-700">
            <Button
              onClick={() => {
                logoutAdmin();
                router.push('/admin/login');
              }}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderView()}
        </main>
      </div>
    </div>
  );
} 