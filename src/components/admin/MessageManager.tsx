'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Message, getAllMessages, markMessageAsRead, markMessageAsArchived, getUnreadMessagesCount } from '@/lib/messages';
import { Mail, Phone, Check, Archive, Filter, RefreshCw, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MessageManager = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | Message['status']>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchMessages();
    loadUnreadCount();
  }, [statusFilter]);

  const fetchMessages = async () => {
    try {
      setIsRefreshing(true);
      const filter = statusFilter === 'all' ? undefined : statusFilter;
      const msgs = await getAllMessages(filter);
      setMessages(msgs);
    } catch (error) {
      console.error("Error fetching messages: ", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadUnreadCount = async () => {
    const count = await getUnreadMessagesCount();
    setUnreadCount(count);
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const result = await markMessageAsRead(messageId);
      if (result.success) {
        // Update local state
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, status: 'read' } : msg
        ));
        // Update unread count
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      alert('Failed to mark message as read. Please try again.');
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      const result = await markMessageAsArchived(messageId);
      if (result.success) {
        // Update local state
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, status: 'archived' } : msg
        ));
        // Update unread count
        await loadUnreadCount();
      }
    } catch (error) {
      console.error('Error archiving message:', error);
      alert('Failed to archive message. Please try again.');
    }
  };

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'unread':
        return 'bg-red-900/50 text-red-400 border-red-600';
      case 'read':
        return 'bg-green-900/50 text-green-400 border-green-600';
      case 'archived':
        return 'bg-gray-900/50 text-gray-400 border-gray-600';
      default:
        return 'bg-gray-900/50 text-gray-400 border-gray-600';
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'unread':
        return <Clock className="h-4 w-4" />;
      case 'read':
        return <CheckCircle className="h-4 w-4" />;
      case 'archived':
        return <Archive className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Loading messages...</p>
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
            <MessageSquare className="mr-2 h-6 w-6" />
            Contact Messages
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-600 text-white text-sm px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={fetchMessages}
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
            <CardTitle className="text-sm font-medium text-gray-300">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{messages.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Unread Messages</CardTitle>
            <Clock className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{unreadCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Read Messages</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {messages.filter(msg => msg.status === 'read').length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Archived</CardTitle>
            <Archive className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {messages.filter(msg => msg.status === 'archived').length}
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
          onClick={() => setStatusFilter('unread')}
          variant={statusFilter === 'unread' ? 'secondary' : 'outline'}
          size="sm"
          className="border-gray-600"
        >
          Unread ({unreadCount})
        </Button>
        <Button
          onClick={() => setStatusFilter('read')}
          variant={statusFilter === 'read' ? 'secondary' : 'outline'}
          size="sm"
          className="border-gray-600"
        >
          Read
        </Button>
        <Button
          onClick={() => setStatusFilter('archived')}
          variant={statusFilter === 'archived' ? 'secondary' : 'outline'}
          size="sm"
          className="border-gray-600"
        >
          Archived
        </Button>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length > 0 ? (
          messages.map(msg => (
            <Card key={msg.id} className={`bg-gray-800 border-gray-700 ${msg.status === 'unread' ? 'ring-2 ring-red-500/50' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{msg.subject}</h3>
                        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${getStatusColor(msg.status)}`}>
                          {getStatusIcon(msg.status)}
                          <span className="ml-1 capitalize">{msg.status}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">
                        From: <strong className="text-white">{msg.name}</strong> ({msg.email})
                        {msg.phone && <span> • Phone: {msg.phone}</span>}
                      </p>
                      <p className="text-gray-300 mb-4">{msg.message}</p>
                      <p className="text-xs text-gray-500">
                        Received: {msg.receivedAt?.toDate().toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => window.location.href = `mailto:${msg.email}?subject=Re: ${msg.subject}&body=Hello ${msg.name},%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0ABest regards,%0D%0AMSA Real Estate`}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    {msg.phone && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => window.location.href = `tel:${msg.phone}`}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {msg.status === 'unread' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkAsRead(msg.id)}
                        className="border-green-600 text-green-400 hover:bg-green-900/50"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Mark as Read
                      </Button>
                    )}
                    {msg.status !== 'archived' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleArchive(msg.id)}
                        className="border-gray-600 text-gray-400 hover:bg-gray-700"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
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
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 text-lg">
                {statusFilter === 'all' ? 'No messages found' : `No ${statusFilter} messages found`}
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Contact messages from your website will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessageManager; 