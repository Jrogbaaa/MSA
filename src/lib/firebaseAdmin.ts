import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '@/types';

export interface TenantDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: Date;
  tenantId: string;
  tenantEmail: string;
  tenantName: string;
  documentType: 'lease' | 'application' | 'insurance' | 'identification' | 'reference' | 'other';
  status: 'pending' | 'signed' | 'expired';
  base64Data?: string;
  description?: string;
}

export interface Tenant extends User {
  documents: TenantDocument[];
  lastActive?: Date;
  status: 'active' | 'inactive';
}

// Fetch all tenants from Firebase
export const getAllTenants = async (): Promise<Tenant[]> => {
  try {
    console.log('Fetching all tenants from Firebase...');
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    const tenants: Tenant[] = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data() as User;
      
      // Convert Firestore timestamps to Date objects
      const user: User = {
        ...userData,
        id: userDoc.id,
        createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
        updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt),
      };

      // Fetch documents for this tenant
      const documents = await getTenantDocuments(user.id);
      
      const tenant: Tenant = {
        ...user,
        documents,
        status: 'active', // We can determine this based on last login, documents, etc.
        lastActive: user.updatedAt
      };
      
      tenants.push(tenant);
    }
    
    console.log(`Fetched ${tenants.length} tenants from Firebase`);
    return tenants.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error('Error fetching tenants:', error);
    throw error;
  }
};

// Fetch documents for a specific tenant
export const getTenantDocuments = async (tenantId: string): Promise<TenantDocument[]> => {
  try {
    const documentsCollection = collection(db, 'tenantDocuments');
    const documentsQuery = query(
      documentsCollection, 
      where('tenantId', '==', tenantId),
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
    
    return documents;
  } catch (error) {
    console.error(`Error fetching documents for tenant ${tenantId}:`, error);
    return [];
  }
};

// Upload a document for a tenant
export const uploadTenantDocument = async (
  tenantId: string, 
  file: File, 
  documentType: TenantDocument['documentType'],
  description?: string
): Promise<TenantDocument> => {
  try {
    console.log(`Uploading document for tenant ${tenantId}...`);
    
    // Get tenant info
    const tenantDoc = await getDoc(doc(db, 'users', tenantId));
    if (!tenantDoc.exists()) {
      throw new Error('Tenant not found');
    }
    
    const tenantData = tenantDoc.data() as User;
    
    // Convert file to base64
    const base64Data = await fileToBase64(file);
    
    // Create document object
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const document: TenantDocument = {
      id: documentId,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadDate: new Date(),
      tenantId,
      tenantEmail: tenantData.email,
      tenantName: `${tenantData.firstName} ${tenantData.lastName}`,
      documentType,
      status: 'pending',
      base64Data,
      description
    };
    
    // Save to Firestore
    await setDoc(doc(db, 'tenantDocuments', documentId), document);
    
    console.log(`Document uploaded successfully: ${document.fileName}`);
    return document;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

// Update document status
export const updateDocumentStatus = async (
  documentId: string, 
  status: TenantDocument['status']
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'tenantDocuments', documentId), { status });
    console.log(`Document ${documentId} status updated to ${status}`);
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
};

// Delete a document
export const deleteTenantDocument = async (documentId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'tenantDocuments', documentId));
    console.log(`Document ${documentId} deleted successfully`);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

// Get tenant by ID
export const getTenantById = async (tenantId: string): Promise<Tenant | null> => {
  try {
    const tenantDoc = await getDoc(doc(db, 'users', tenantId));
    if (!tenantDoc.exists()) {
      return null;
    }
    
    const userData = tenantDoc.data() as User;
    const user: User = {
      ...userData,
      id: tenantDoc.id,
      createdAt: userData.createdAt instanceof Date ? userData.createdAt : new Date(userData.createdAt),
      updatedAt: userData.updatedAt instanceof Date ? userData.updatedAt : new Date(userData.updatedAt),
    };
    
    const documents = await getTenantDocuments(tenantId);
    
    return {
      ...user,
      documents,
      status: 'active',
      lastActive: user.updatedAt
    };
  } catch (error) {
    console.error(`Error fetching tenant ${tenantId}:`, error);
    return null;
  }
};

// Update tenant information
export const updateTenant = async (tenantId: string, updates: Partial<User>): Promise<void> => {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await updateDoc(doc(db, 'users', tenantId), updateData);
    console.log(`Tenant ${tenantId} updated successfully`);
  } catch (error) {
    console.error('Error updating tenant:', error);
    throw error;
  }
};

// Utility function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

// Get tenant statistics
export const getTenantStatistics = async () => {
  try {
    const tenants = await getAllTenants();
    const totalDocuments = tenants.reduce((sum, tenant) => sum + tenant.documents.length, 0);
    const tenantsWithDocuments = tenants.filter(tenant => tenant.documents.length > 0).length;
    const signedDocuments = tenants.reduce((sum, tenant) => 
      sum + tenant.documents.filter(doc => doc.status === 'signed').length, 0
    );
    
    return {
      totalTenants: tenants.length,
      totalDocuments,
      tenantsWithDocuments,
      signedDocuments,
      activeTenants: tenants.filter(tenant => tenant.status === 'active').length
    };
  } catch (error) {
    console.error('Error getting tenant statistics:', error);
    return {
      totalTenants: 0,
      totalDocuments: 0,
      tenantsWithDocuments: 0,
      signedDocuments: 0,
      activeTenants: 0
    };
  }
}; 