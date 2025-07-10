import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
}

const APPLICATIONS_COLLECTION = 'applications';

export const saveApplication = async (applicationData: Omit<Application, 'id' | 'status' | 'submittedAt'>) => {
  try {
    const id = `app_${Date.now()}`;
    const application: Application = {
      id,
      ...applicationData,
      status: 'pending',
      submittedAt: serverTimestamp(),
    };
    await setDoc(doc(db, APPLICATIONS_COLLECTION, id), application);
    return { success: true, id };
  } catch (error) {
    console.error('Error saving application:', error);
    return { success: false, error };
  }
}; 