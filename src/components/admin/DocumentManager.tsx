'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Download, Trash2, User, Calendar, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Document {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  tenantEmail: string;
  tenantName: string;
  documentType: 'lease' | 'application' | 'insurance' | 'identification' | 'reference' | 'other';
  url: string;
}

interface Tenant {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  documents: Document[];
}

// Mock data for demonstration
const mockTenants: Tenant[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    documents: [
      {
        id: 'doc1',
        fileName: 'lease_agreement_2024.pdf',
        fileType: 'application/pdf',
        fileSize: 2048000,
        uploadDate: new Date('2024-01-15'),
        tenantEmail: 'john.doe@example.com',
        tenantName: 'John Doe',
        documentType: 'lease',
        url: '/documents/lease_agreement_2024.pdf'
      }
    ]
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    documents: []
  }
];

export default function DocumentManager() {
  const [tenants, setTenants] = useState<Tenant[]>(mockTenants);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    tenantId: '',
    documentType: 'other' as Document['documentType'],
    file: null as File | null
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const getDocumentTypeLabel = (type: Document['documentType']): string => {
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

  const getDocumentTypeColor = (type: Document['documentType']): string => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = () => {
    if (!uploadForm.file || !uploadForm.tenantId) return;

    const newDocument: Document = {
      id: Date.now().toString(),
      fileName: uploadForm.file.name,
      fileType: uploadForm.file.type,
      fileSize: uploadForm.file.size,
      uploadDate: new Date(),
      tenantEmail: tenants.find(t => t.id === uploadForm.tenantId)?.email || '',
      tenantName: tenants.find(t => t.id === uploadForm.tenantId)?.firstName + ' ' + tenants.find(t => t.id === uploadForm.tenantId)?.lastName || '',
      documentType: uploadForm.documentType,
      url: `/documents/${uploadForm.file.name}`
    };

    setTenants(prevTenants =>
      prevTenants.map(tenant =>
        tenant.id === uploadForm.tenantId
          ? { ...tenant, documents: [...tenant.documents, newDocument] }
          : tenant
      )
    );

    // Reset form
    setUploadForm({
      tenantId: '',
      documentType: 'other',
      file: null
    });
    setIsUploadModalOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    alert('Document uploaded successfully!');
  };

  const handleDeleteDocument = (documentId: string, tenantId: string) => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      setTenants(prevTenants =>
        prevTenants.map(tenant =>
          tenant.id === tenantId
            ? { ...tenant, documents: tenant.documents.filter(doc => doc.id !== documentId) }
            : tenant
        )
      );
      alert('Document deleted successfully!');
    }
  };

  const getTotalDocuments = () => {
    return tenants.reduce((total, tenant) => total + tenant.documents.length, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FileText className="mr-2 h-6 w-6" />
          Document Management
        </h2>
        <Button 
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Tenants</CardTitle>
            <User className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{tenants.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{getTotalDocuments()}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tenants with Documents</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {tenants.filter(t => t.documents.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tenant List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Tenants</CardTitle>
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
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTenants.map((tenant) => (
              <div
                key={tenant.id}
                onClick={() => setSelectedTenantId(tenant.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTenantId === tenant.id
                    ? 'bg-blue-900/50 border border-blue-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium">
                      {tenant.firstName} {tenant.lastName}
                    </div>
                    <div className="text-gray-400 text-sm">{tenant.email}</div>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {tenant.documents.length} doc{tenant.documents.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Document List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {selectedTenant ? `Documents for ${selectedTenant.firstName} ${selectedTenant.lastName}` : 'Select a tenant'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {selectedTenant ? (
              selectedTenant.documents.length > 0 ? (
                selectedTenant.documents.map((document) => (
                  <div key={document.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-400" />
                        <div>
                          <div className="text-white font-medium">{document.fileName}</div>
                          <div className="text-gray-400 text-xs">
                            {formatFileSize(document.fileSize)} • {document.uploadDate.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-600"
                          onClick={() => window.open(document.url, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-900/50"
                          onClick={() => handleDeleteDocument(document.id, selectedTenant.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getDocumentTypeColor(document.documentType)}`}>
                      {getDocumentTypeLabel(document.documentType)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>Select a tenant to view their documents</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-white">Upload Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Tenant
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
                  Document Type
                </label>
                <select
                  value={uploadForm.documentType}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, documentType: e.target.value as Document['documentType'] }))}
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
                  Choose File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
                  disabled={!uploadForm.file || !uploadForm.tenantId}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
                <Button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadForm({ tenantId: '', documentType: 'other', file: null });
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
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