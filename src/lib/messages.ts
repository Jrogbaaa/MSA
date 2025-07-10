import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  status: 'unread' | 'read' | 'archived';
  receivedAt: any;
}

const MESSAGES_COLLECTION = 'messages';

export const saveMessage = async (messageData: Omit<Message, 'id' | 'status' | 'receivedAt'>) => {
  try {
    const id = `msg_${Date.now()}`;
    const message: Message = {
      id,
      ...messageData,
      status: 'unread',
      receivedAt: serverTimestamp(),
    };
    await setDoc(doc(db, MESSAGES_COLLECTION, id), message);
    return { success: true, id };
  } catch (error) {
    console.error('Error saving message:', error);
    return { success: false, error };
  }
}; 