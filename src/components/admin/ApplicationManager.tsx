'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Application, getAllApplications, markApplicationAsRead, updateApplicationStatus, getUnreadApplicationsCount, getPendingApplicationsCount } from '@/lib/applications';
import { Mail, Phone, Check, RefreshCw, Briefcase, Clock, CheckCircle, UserCheck, UserX, Filter, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const ApplicationManager = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | Application['status']>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchApplications();
    loadCounts();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setIsRefreshing(true);
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const apps = await getAllApplications(filter);
      setApplications(apps);
    } catch (error) {
      console.error("Error fetching applications: ", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadCounts = async () => {
    const [unread, pending] = await Promise.all([
      getUnreadApplicationsCount(),
      getPendingApplicationsCount()
    ]);
    setUnreadCount(unread);
    setPendingCount(pending);
  };

  const handleMarkAsRead = async (applicationId: string) => {
    try {
      const result = await markApplicationAsRead(applicationId);
      if (result.success) {
        // Update local state
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, isRead: true } : app
        ));
        // Update counts
        await loadCounts();
      }
    } catch (error) {
      console.error('Error marking application as read:', error);
      alert('Failed to mark application as read. Please try again.');
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: Application['status']) => {
    try {
      const result = await updateApplicationStatus(applicationId, newStatus);
      if (result.success) {
        // Update local state
        setApplications(applications.map(app => 
          app.id === applicationId ? { ...app, status: newStatus } : app
        ));
        // Update counts
        await loadCounts();
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status. Please try again.');
    }
  };

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-600';
      case 'viewing':
        return 'bg-blue-900/50 text-blue-400 border-blue-600';
      case 'accepted':
        return 'bg-green-900/50 text-green-400 border-green-600';
      case 'rejected':
        return 'bg-red-900/50 text-red-400 border-red-600';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-600';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'viewing':
        return <Eye className="h-4 w-4" />;
      case 'accepted':
        return <UserCheck className="h-4 w-4" />;
      case 'rejected':
        return <UserX className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Briefcase className="mr-2 h-6 w-6" />
            Property Applications
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={fetchApplications}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Applications</CardTitle>
            <Briefcase className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{applications.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Unread</CardTitle>
            <Clock className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Accepted</CardTitle>
            <UserCheck className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {applications.filter(app => app.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <span className="text-gray-400 text-sm">Filter:</span>
        <Button
          onClick={() => setStatusFilter('all')}
          variant={statusFilter === 'all' ? 'secondary' : 'outline'}
          size="sm"
          className="border-gray-600"
        >
          All
        </Button>
        <Button
          onClick={() => setStatusFilter('pending')}
          variant={statusFilter === 'pending' ? 'secondary' : 'outline'}
          size="sm"
          className="border-gray-600"
        >
          Pending ({pendingCount})
        </Button>
        <Button
          onClick={() => setStatusFilter('viewing')}
          variant={statusFilter === 'viewing' ? 'secondary' : 'outline'}
          size="sm"
          className="border-gray-600"
        >
          Viewing
        </Button>
        <Button
          onClick={() => setStatusFilter('accepted')}
          variant={statusFilter === 'accepted' ? 'secondary' : 'outline'}
          size="sm"
          className="border-gray-600"
        >
          Accepted
        </Button>
        <Button
          onClick={() => setStatusFilter('rejected')}
          variant={statusFilter === 'rejected' ? 'secondary' : 'outline'}
          size="sm"
          className="border-gray-600"
        >
          Rejected
        </Button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {applications.length > 0 ? (
          applications.map(app => (
            <Card key={app.id} className={`bg-gray-800 border-gray-700 ${!app.isRead ? 'ring-2 ring-red-500/50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{app.propertyTitle}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1 capitalize">{app.status}</span>
                        </span>
                        {!app.isRead && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{app.propertyAddress}</p>
                      
                      <div className="bg-gray-700 p-4 rounded-lg mb-4">
                        <h4 className="text-white font-medium mb-2">Applicant Information:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Name:</span>
                            <p className="text-white font-medium">{app.applicantName}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Email:</span>
                            <p className="text-white">{app.applicantEmail}</p>
                          </div>
                          <div>
                            <span className="text-gray-400">Phone:</span>
                            <p className="text-white">{app.applicantPhone}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500">
                        Submitted: {app.submittedAt?.toDate().toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => window.location.href = `mailto:${app.applicantEmail}?subject=Re: Application for ${app.propertyTitle}&body=Hello ${app.applicantName},%0D%0A%0D%0AThank you for your application for ${app.propertyTitle}.%0D%0A%0D%0ABest regards,%0D%0AMSA Real Estate`}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.location.href = `tel:${app.applicantPhone}`}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                  </div>
                  
                  <div className="flex space-x-2 flex-wrap">
                    {!app.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(app.id)}
                        className="border-green-600 text-green-400 hover:bg-green-900/50"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                    
                    {app.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(app.id, 'viewing')}
                          className="border-blue-600 text-blue-400 hover:bg-blue-900/50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Schedule Viewing
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(app.id, 'accepted')}
                          className="border-green-600 text-green-400 hover:bg-green-900/50"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="border-red-600 text-red-400 hover:bg-red-900/50"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {app.status === 'viewing' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(app.id, 'accepted')}
                          className="border-green-600 text-green-400 hover:bg-green-900/50"
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(app.id, 'rejected')}
                          className="border-red-600 text-red-400 hover:bg-red-900/50"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {(app.status === 'accepted' || app.status === 'rejected') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(app.id, 'pending')}
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/50"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Move to Pending
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="text-center py-12">
              <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 text-lg">
                {statusFilter === 'all' ? 'No applications found' : `No ${statusFilter} applications found`}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Property applications from your website will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApplicationManager; 