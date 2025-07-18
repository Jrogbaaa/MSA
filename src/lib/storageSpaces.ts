import { collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, addDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { StorageSpace } from '@/types';
import { storageSpaces as initialStorageSpaces } from '@/data/storageSpaces';

const STORAGE_SPACES_COLLECTION = 'storageSpaces';

// Get all storage spaces from Firestore
export const getAllStorageSpaces = async (): Promise<StorageSpace[]> => {
  try {
    console.log('🔄 Fetching storage spaces from Firestore...');
    const q = query(collection(db, STORAGE_SPACES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('📦 No storage spaces found in Firestore, returning initial data');
      return initialStorageSpaces;
    }
    
    const storageSpaces = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as StorageSpace;
    });
    
    console.log(`✅ Successfully fetched ${storageSpaces.length} storage spaces from Firestore`);
    return storageSpaces;
  } catch (error) {
    console.error('❌ Error fetching storage spaces from Firestore:', error);
    
    // Fallback to localStorage
    try {
      const localData = localStorage.getItem('msa_storage_spaces');
      if (localData) {
        const parsed = JSON.parse(localData);
        console.log('📱 Using localStorage fallback for storage spaces');
        return parsed.map((space: any) => ({
          ...space,
          createdAt: new Date(space.createdAt),
          updatedAt: new Date(space.updatedAt),
        }));
      }
    } catch (localError) {
      console.error('❌ localStorage fallback failed:', localError);
    }
    
    console.log('🔄 Using initial storage spaces data as final fallback');
    return initialStorageSpaces;
  }
};

// Subscribe to real-time storage spaces updates
export const subscribeToStorageSpaces = (callback: (storageSpaces: StorageSpace[]) => void): (() => void) => {
  console.log('🔄 Setting up real-time storage spaces subscription...');
  
  try {
    const q = query(collection(db, STORAGE_SPACES_COLLECTION), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          console.log('📦 No storage spaces in Firestore, using initial data');
          callback(initialStorageSpaces);
          // Save to localStorage as backup
          localStorage.setItem('msa_storage_spaces', JSON.stringify(initialStorageSpaces));
          return;
        }
        
        const storageSpaces = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as StorageSpace;
        });
        
        console.log(`🔄 Real-time update: ${storageSpaces.length} storage spaces`);
        callback(storageSpaces);
        
        // Save to localStorage as backup
        localStorage.setItem('msa_storage_spaces', JSON.stringify(storageSpaces));
      },
      (error) => {
        console.error('❌ Storage spaces subscription error:', error);
        
        // Enhanced error handling to prevent Firebase internal assertion failures
        if (error.code === 'permission-denied' || error.code === 'failed-precondition' || error.code === 'internal') {
          console.log('🔧 Firebase permission/state error detected, using localStorage fallback');
        }
        
        // Fallback to localStorage
        try {
          const localData = localStorage.getItem('msa_storage_spaces');
          if (localData) {
            const parsed = JSON.parse(localData);
            console.log('📱 Using localStorage fallback for real-time subscription');
            callback(parsed.map((space: any) => ({
              ...space,
              createdAt: new Date(space.createdAt),
              updatedAt: new Date(space.updatedAt),
            })));
            return;
          }
        } catch (localError) {
          console.error('❌ localStorage fallback failed in subscription:', localError);
        }
        
        console.log('🔄 Using initial storage spaces data in subscription fallback');
        callback(initialStorageSpaces);
      }
    );
    
    return unsubscribe;
  } catch (error) {
    console.error('❌ Failed to set up storage spaces subscription:', error);
    
    // Immediate fallback
    try {
      const localData = localStorage.getItem('msa_storage_spaces');
      if (localData) {
        const parsed = JSON.parse(localData);
        console.log('📱 Using localStorage for subscription setup fallback');
        callback(parsed.map((space: any) => ({
          ...space,
          createdAt: new Date(space.createdAt),
          updatedAt: new Date(space.updatedAt),
        })));
      } else {
        callback(initialStorageSpaces);
      }
    } catch (localError) {
      console.error('❌ All fallbacks failed, using initial data:', localError);
      callback(initialStorageSpaces);
    }
    
    // Return empty unsubscribe function
    return () => {};
  }
};

// Add a new storage space
export const addStorageSpace = async (storageSpace: Omit<StorageSpace, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const newStorageSpace = {
      ...storageSpace,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, STORAGE_SPACES_COLLECTION), newStorageSpace);
    console.log('✅ Storage space added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error adding storage space:', error);
    throw error;
  }
};

// Update an existing storage space
export const updateStorageSpace = async (id: string, updates: Partial<StorageSpace>): Promise<void> => {
  try {
    const storageSpaceRef = doc(db, STORAGE_SPACES_COLLECTION, id);
    await updateDoc(storageSpaceRef, {
      ...updates,
      updatedAt: new Date(),
    });
    console.log('✅ Storage space updated successfully:', id);
  } catch (error) {
    console.error('❌ Error updating storage space:', error);
    throw error;
  }
};

// Delete a storage space
export const deleteStorageSpace = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, STORAGE_SPACES_COLLECTION, id));
    console.log('✅ Storage space deleted successfully:', id);
  } catch (error) {
    console.error('❌ Error deleting storage space:', error);
    throw error;
  }
};

// Reset to default storage spaces (for demo purposes)
export const resetToDefaultStorageSpaces = async (): Promise<void> => {
  try {
    console.log('🔄 Resetting to default storage spaces...');
    
    // Delete all existing storage spaces
    const querySnapshot = await getDocs(collection(db, STORAGE_SPACES_COLLECTION));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Add default storage spaces
    const addPromises = initialStorageSpaces.map(space => {
      const { id, ...spaceData } = space;
      return setDoc(doc(db, STORAGE_SPACES_COLLECTION, id), spaceData);
    });
    
    await Promise.all(addPromises);
    console.log('✅ Successfully reset to default storage spaces');
  } catch (error) {
    console.error('❌ Error resetting storage spaces:', error);
    throw error;
  }
};

// Clear all storage spaces data
export const clearAllStorageSpacesData = async (): Promise<void> => {
  try {
    console.log('🗑️ Clearing all storage spaces data...');
    
    const querySnapshot = await getDocs(collection(db, STORAGE_SPACES_COLLECTION));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    // Clear localStorage backup
    localStorage.removeItem('msa_storage_spaces');
    
    console.log('✅ All storage spaces data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing storage spaces data:', error);
    throw error;
  }
}; 