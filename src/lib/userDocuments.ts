import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { TenantDocument } from './firebaseAdmin';

// Fetch documents for the current user
export const getUserDocuments = async (userId: string): Promise<TenantDocument[]> => {
  try {
    console.log(`Fetching documents for user ${userId}...`);
    
    const documentsCollection = collection(db, 'tenantDocuments');
    const documentsQuery = query(
      documentsCollection,
      where('tenantId', '==', userId),
      orderBy('uploadDate', 'desc')
    );
    
    const documentsSnapshot = await getDocs(documentsQuery);
    
    const documents: TenantDocument[] = documentsSnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        ...data,
        id: docSnapshot.id,
        uploadDate: data.uploadDate instanceof Date ? data.uploadDate : new Date(data.uploadDate),
      } as TenantDocument;
    });
    
    console.log(`Found ${documents.length} documents for user`);
    return documents;
  } catch (error) {
    console.error(`Error fetching documents for user ${userId}:`, error);
    return [];
  }
};

// Download document helper
export const downloadDocument = (tenantDocument: TenantDocument) => {
  if (tenantDocument.base64Data) {
    try {
      // Create download link for base64 data
      const link = document.createElement('a');
      link.href = tenantDocument.base64Data;
      link.download = tenantDocument.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  } else {
    alert('Document data not available for download.');
  }
};

// Get document type display name
export const getDocumentTypeDisplayName = (type: TenantDocument['documentType']): string => {
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

// Get status color class
export const getStatusColorClass = (status: TenantDocument['status']): string => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    signed: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800'
  };
  return colors[status];
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 