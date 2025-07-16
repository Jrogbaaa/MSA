import { collection, doc, setDoc, serverTimestamp, updateDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
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

// Update message status
export const updateMessageStatus = async (messageId: string, status: Message['status']) => {
  try {
    await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), { 
      status,
      updatedAt: serverTimestamp()
    });
    console.log(`Message ${messageId} status updated to ${status}`);
    return { success: true };
  } catch (error) {
    console.error('Error updating message status:', error);
    return { success: false, error };
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  return updateMessageStatus(messageId, 'read');
};

// Mark message as archived
export const markMessageAsArchived = async (messageId: string) => {
  return updateMessageStatus(messageId, 'archived');
};

// Get unread messages count
export const getUnreadMessagesCount = async () => {
  try {
    const q = query(collection(db, MESSAGES_COLLECTION), where('status', '==', 'unread'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread messages count:', error);
    return 0;
  }
};

// Get all messages with optional status filter
export const getAllMessages = async (statusFilter?: Message['status']) => {
  try {
    let q;
    if (statusFilter) {
      q = query(
        collection(db, MESSAGES_COLLECTION), 
        where('status', '==', statusFilter),
        orderBy('receivedAt', 'desc')
      );
    } else {
      q = query(collection(db, MESSAGES_COLLECTION), orderBy('receivedAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    const messages = querySnapshot.docs.map(doc => ({ 
      ...doc.data() as Message, 
      id: doc.id 
    }));
    return messages;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}; 