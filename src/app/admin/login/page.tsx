'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import { authenticateAdmin, isAdminAuthenticated } from '@/lib/adminAuth';


export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    // Check if admin is already authenticated
    if (isAdminAuthenticated()) {
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate processing time for security
    await new Promise(resolve => setTimeout(resolve, 1000));

    const isAuthenticated = authenticateAdmin(username, password);
    
    if (isAuthenticated) {
      console.log('Admin authenticated successfully');
      router.push('/admin/dashboard');
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-red-600 p-4 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Restricted area - authorized personnel only
          </p>
        </div>

        {/* Admin Login Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-center text-white">Administrator Login</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-md p-4">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="pl-10 pr-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Access Admin Panel
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="bg-yellow-900/30 border border-yellow-700 rounded-md p-4">
              <p className="text-xs text-yellow-200">
                <strong>Security Notice:</strong> All admin access attempts are logged. 
                Unauthorized access is prohibited and will be reported.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="flex justify-between text-sm">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-400 hover:text-white"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Home
          </Link>
          <Link 
            href="/auth/signin" 
            className="text-gray-400 hover:text-white"
          >
            User Login
          </Link>
        </div>

        {/* Admin Info (only show in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-900/30 border border-blue-700 rounded-md p-4">
            <p className="text-xs text-blue-200">
              <strong>Development Mode:</strong><br />
              Username: arnoldestatesmsa<br />
              Password: [Contact Admin for Password]
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 