'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Download, Trash2, User, Calendar, Search, Plus, Mail, Phone, Edit, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  getAllTenants, 
  uploadTenantDocument, 
  deleteTenantDocument, 
  updateDocumentStatus,
  getTenantStatistics,
  Tenant,
  TenantDocument 
} from '@/lib/firebaseAdmin';

export default function TenantManager() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTenants: 0,
    totalDocuments: 0,
    tenantsWithDocuments: 0,
    signedDocuments: 0,
    activeTenants: 0
  });
  const [uploadForm, setUploadForm] = useState({
    tenantId: '',
    documentType: 'other' as TenantDocument['documentType'],
    description: '',
    file: null as File | null
  });
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load tenants and statistics
  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      console.log('Loading tenants from Firebase...');
      
      const [tenantsData, statsData] = await Promise.all([
        getAllTenants(),
        getTenantStatistics()
      ]);
      
      setTenants(tenantsData);
      setStats(statsData);
      console.log(`Loaded ${tenantsData.length} tenants`);
    } catch (error) {
      console.error('Error loading tenants:', error);
      alert('Failed to load tenants. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTenant = selectedTenantId ? tenants.find(t => t.id === selectedTenantId) : null;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentTypeLabel = (type: TenantDocument['documentType']): string => {
    const labels = {
      lease: 'Lease Agreement',
      application: 'Application Form',
      insurance: 'Insurance Document',
      identification: 'ID Document',
      reference: 'Reference Letter',
      other: 'Other Document'
    };
    return labels[type];
  };

  const getDocumentTypeColor = (type: TenantDocument['documentType']): string => {
    const colors = {
      lease: 'bg-blue-900/50 text-blue-400',
      application: 'bg-green-900/50 text-green-400',
      insurance: 'bg-purple-900/50 text-purple-400',
      identification: 'bg-yellow-900/50 text-yellow-400',
      reference: 'bg-indigo-900/50 text-indigo-400',
      other: 'bg-gray-700 text-gray-300'
    };
    return colors[type];
  };

  const getStatusColor = (status: TenantDocument['status']): string => {
    const colors = {
      pending: 'bg-yellow-900/50 text-yellow-400',
      signed: 'bg-green-900/50 text-green-400',
      expired: 'bg-red-900/50 text-red-400'
    };
    return colors[status];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file || !uploadForm.tenantId) return;

    try {
      setIsUploading(true);
      console.log('Uploading document...');
      
      await uploadTenantDocument(
        uploadForm.tenantId,
        uploadForm.file,
        uploadForm.documentType,
        uploadForm.description
      );

      // Reload tenants to get updated data
      await loadTenants();

      // Reset form
      setUploadForm({
        tenantId: '',
        documentType: 'other',
        description: '',
        file: null
      });
      setIsUploadModalOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTenantDocument(documentId);
      await loadTenants(); // Reload to get updated data
      alert('Document deleted successfully!');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleStatusUpdate = async (documentId: string, newStatus: TenantDocument['status']) => {
    try {
      await updateDocumentStatus(documentId, newStatus);
      await loadTenants(); // Reload to get updated data
      console.log(`Document status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating document status:', error);
      alert('Failed to update document status. Please try again.');
    }
  };

  const handleDownloadDocument = (document: TenantDocument) => {
    if (document.base64Data) {
      // Create download link for base64 data
      const link = document.createElement('a');
      link.href = document.base64Data;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Document data not available for download.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-white">Loading tenants from Firebase...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <User className="mr-2 h-6 w-6" />
          Tenant Management
        </h2>
        <div className="flex space-x-3">
          <Button 
            onClick={loadTenants}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            Refresh
          </Button>
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Tenants</CardTitle>
            <User className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTenants}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalDocuments}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">With Documents</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.tenantsWithDocuments}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Signed Docs</CardTitle>
            <Check className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.signedDocuments}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Active Tenants</CardTitle>
            <User className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.activeTenants}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Tenants ({filteredTenants.length})</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tenants..."
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredTenants.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tenants found</p>
                {searchTerm && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              filteredTenants.map((tenant) => (
                <div
                  key={tenant.id}
                  onClick={() => setSelectedTenantId(tenant.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    selectedTenantId === tenant.id
                      ? 'bg-blue-900/50 border border-blue-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {tenant.photoURL ? (
                          <img 
                            src={tenant.photoURL} 
                            alt={`${tenant.firstName} ${tenant.lastName}`}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {tenant.firstName?.charAt(0)}{tenant.lastName?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="text-white font-medium">
                            {tenant.firstName} {tenant.lastName}
                          </div>
                          <div className="text-gray-400 text-sm">{tenant.email}</div>
                          {tenant.phone && (
                            <div className="text-gray-500 text-xs">{tenant.phone}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">
                        {tenant.documents.length} doc{tenant.documents.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-gray-500 text-xs">
                        Joined {tenant.createdAt.toLocaleDateString('en-GB')}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Document List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span>
                {selectedTenant 
                  ? `Documents for ${selectedTenant.firstName} ${selectedTenant.lastName}` 
                  : 'Select a tenant'
                }
              </span>
              {selectedTenant && (
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    onClick={() => {
                      const mailtoLink = `mailto:${selectedTenant.email}?subject=Document Updates&body=Hello ${selectedTenant.firstName},`;
                      window.open(mailtoLink, '_blank');
                    }}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  {selectedTenant.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => {
                        const phoneNumber = selectedTenant.phone?.replace(/\D/g, '');
                        window.open(`tel:${phoneNumber}`, '_self');
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto">
            {selectedTenant ? (
              selectedTenant.documents.length > 0 ? (
                selectedTenant.documents.map((document) => (
                  <div key={document.id} className="p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        <FileText className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{document.fileName}</div>
                          <div className="text-gray-400 text-xs">
                            {formatFileSize(document.fileSize)} • {document.uploadDate.toLocaleDateString('en-GB')}
                          </div>
                          {document.description && (
                            <div className="text-gray-400 text-sm mt-1">{document.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-600"
                          onClick={() => handleDownloadDocument(document)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900/50"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getDocumentTypeColor(document.documentType)}`}>
                          {getDocumentTypeLabel(document.documentType)}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(document.status)}`}>
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex space-x-1">
                        {document.status !== 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-yellow-400 hover:bg-yellow-900/20"
                            onClick={() => handleStatusUpdate(document.id, 'pending')}
                          >
                            Set Pending
                          </Button>
                        )}
                        {document.status !== 'signed' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-400 hover:bg-green-900/20"
                            onClick={() => handleStatusUpdate(document.id, 'signed')}
                          >
                            Mark Signed
                          </Button>
                        )}
                        {document.status !== 'expired' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:bg-red-900/20"
                            onClick={() => handleStatusUpdate(document.id, 'expired')}
                          >
                            Mark Expired
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">No documents uploaded</p>
                  <p className="text-sm mt-1">Upload documents for this tenant using the button above</p>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-gray-400">
                <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a tenant</p>
                <p className="text-sm mt-1">Choose a tenant from the list to view and manage their documents</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-white">Upload Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Tenant *
                </label>
                <select
                  value={uploadForm.tenantId}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tenantId: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Choose tenant...</option>
                  {tenants.map((tenant) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.firstName} {tenant.lastName} ({tenant.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document Type *
                </label>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, documentType: e.target.value as TenantDocument['documentType'] }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lease">Lease Agreement</option>
                  <option value="application">Application Form</option>
                  <option value="insurance">Insurance Document</option>
                  <option value="identification">ID Document</option>
                  <option value="reference">Reference Letter</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <Input
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the document..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose File *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {uploadForm.file && (
                  <p className="text-gray-400 text-sm mt-2">
                    Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                  </p>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  onClick={handleUpload}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!uploadForm.file || !uploadForm.tenantId || isUploading}
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({ tenantId: '', documentType: 'other', description: '', file: null });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 