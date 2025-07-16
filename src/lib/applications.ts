import { collection, doc, setDoc, serverTimestamp, updateDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';

export interface Application {
  id: string;
  propertyTitle: string;
  propertyAddress: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  message?: string;
  status: 'pending' | 'viewing' | 'rejected' | 'accepted';
  submittedAt: any;
  isRead?: boolean; // Add read status for admin notifications
}

const APPLICATIONS_COLLECTION = 'applications';

export const saveApplication = async (applicationData: Omit<Application, 'id' | 'status' | 'submittedAt' | 'isRead'>) => {
  try {
    const id = `app_${Date.now()}`;
    const application: Application = {
      id,
      ...applicationData,
      status: 'pending',
      submittedAt: serverTimestamp(),
      isRead: false,
    };
    await setDoc(doc(db, APPLICATIONS_COLLECTION, id), application);
    return { success: true, id };
  } catch (error) {
    console.error('Error saving application:', error);
    return { success: false, error };
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId: string, status: Application['status']) => {
  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, applicationId), { 
      status,
      updatedAt: serverTimestamp()
    });
    console.log(`Application ${applicationId} status updated to ${status}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating application status:', error);
    return { success: false, error };
  }
};

// Mark application as read
export const markApplicationAsRead = async (applicationId: string) => {
  try {
    await updateDoc(doc(db, APPLICATIONS_COLLECTION, applicationId), { 
      isRead: true,
      readAt: serverTimestamp()
    });
    console.log(`Application ${applicationId} marked as read`);
    return { success: true };
  } catch (error) {
    console.error('Error marking application as read:', error);
    return { success: false, error };
  }
};

// Get unread applications count
export const getUnreadApplicationsCount = async () => {
  try {
    const q = query(collection(db, APPLICATIONS_COLLECTION), where('isRead', '==', false));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread applications count:', error);
    return 0;
  }
};

// Get pending applications count
export const getPendingApplicationsCount = async () => {
  try {
    const q = query(collection(db, APPLICATIONS_COLLECTION), where('status', '==', 'pending'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting pending applications count:', error);
    return 0;
  }
};

// Get all applications with optional status filter
export const getAllApplications = async (statusFilter?: Application['status']) => {
  try {
    let q;
    if (statusFilter) {
      q = query(
        collection(db, APPLICATIONS_COLLECTION), 
        where('status', '==', statusFilter),
        orderBy('submittedAt', 'desc')
      );
    } else {
      q = query(collection(db, APPLICATIONS_COLLECTION), orderBy('submittedAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    const applications = querySnapshot.docs.map(doc => ({ 
      ...doc.data() as Application, 
      id: doc.id 
    }));
    return applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}; 