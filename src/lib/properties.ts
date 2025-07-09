import { collection, getDocs, doc, setDoc, getDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { Property } from '@/types';
import { properties as initialProperties } from '@/data/properties';

// Properties collection name
const PROPERTIES_COLLECTION = 'properties';
const LOCALSTORAGE_KEY = 'msa_admin_properties';

// Error handling utility
const handleFirebaseError = (error: any, operation: string) => {
  console.error(`Firebase ${operation} error:`, error);
  // Don't throw errors in production to allow localStorage fallback
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`${operation} failed, using localStorage fallback`);
  }
};

// Convert Firestore document to Property
const convertFirestoreToProperty = (doc: any): Property => {
  const data = doc.data();
  return {
    ...data,
    id: doc.id,
    createdAt: data.createdAt?.toDate() || new Date(data.createdAt),
    updatedAt: data.updatedAt?.toDate() || new Date(data.updatedAt),
  };
};

// Convert Property to Firestore document
const convertPropertyToFirestore = (property: Property) => {
  return {
    ...property,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
};

// Fetch all properties from Firebase with localStorage fallback
export const getAllProperties = async (): Promise<Property[]> => {
  try {
    console.log('🔥 Fetching properties from Firebase...');
    const propertiesCollection = collection(db, PROPERTIES_COLLECTION);
    const propertiesQuery = query(propertiesCollection, orderBy('createdAt', 'desc'));
    const propertiesSnapshot = await getDocs(propertiesQuery);
    
    const properties: Property[] = propertiesSnapshot.docs.map(convertFirestoreToProperty);
    
    console.log(`✅ Fetched ${properties.length} properties from Firebase`);
    
    // Also update localStorage for offline access
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(properties));
    }
    
    return properties.length > 0 ? properties : initialProperties;
  } catch (error) {
    handleFirebaseError(error, 'fetch properties');
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedProperties = localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedProperties) {
          const parsedProperties = JSON.parse(savedProperties);
          const propertiesWithDates = parsedProperties.map((property: any) => ({
            ...property,
            createdAt: new Date(property.createdAt),
            updatedAt: new Date(property.updatedAt)
          }));
          console.log(`📱 Loaded ${propertiesWithDates.length} properties from localStorage fallback`);
          return propertiesWithDates;
        }
      } catch (storageError) {
        console.error('localStorage fallback error:', storageError);
      }
    }
    
    // Final fallback to initial properties
    console.log('📦 Using initial properties as final fallback');
    return initialProperties;
  }
};

// Get property by ID
export const getPropertyById = async (propertyId: string): Promise<Property | null> => {
  try {
    console.log(`🔍 Fetching property ${propertyId} from Firebase...`);
    const propertyDoc = await getDoc(doc(db, PROPERTIES_COLLECTION, propertyId));
    
    if (propertyDoc.exists()) {
      const property = convertFirestoreToProperty(propertyDoc);
      console.log(`✅ Found property: ${property.title}`);
      return property;
    }
    
    console.log('❌ Property not found in Firebase');
    return null;
  } catch (error) {
    handleFirebaseError(error, 'fetch property');
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedProperties = localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedProperties) {
          const parsedProperties = JSON.parse(savedProperties);
          const property = parsedProperties.find((p: Property) => p.id === propertyId);
          if (property) {
            return {
              ...property,
              createdAt: new Date(property.createdAt),
              updatedAt: new Date(property.updatedAt)
            };
          }
        }
      } catch (storageError) {
        console.error('localStorage fallback error:', storageError);
      }
    }
    
    // Final fallback to initial properties
    const property = initialProperties.find(p => p.id === propertyId);
    return property || null;
  }
};

// Save property to Firebase with localStorage backup
export const saveProperty = async (property: Property): Promise<Property> => {
  try {
    console.log(`💾 Saving property "${property.title}" to Firebase...`);
    
    const propertyData = convertPropertyToFirestore(property);
    await setDoc(doc(db, PROPERTIES_COLLECTION, property.id), propertyData);
    
    console.log(`✅ Property "${property.title}" saved to Firebase successfully`);
    
    // Also save to localStorage for offline access
    if (typeof window !== 'undefined') {
      const allProperties = await getAllProperties();
      const updatedProperties = allProperties.map(p => 
        p.id === property.id ? property : p
      );
      if (!updatedProperties.find(p => p.id === property.id)) {
        updatedProperties.push(property);
      }
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedProperties));
    }
    
    return property;
  } catch (error) {
    handleFirebaseError(error, 'save property');
    
    // Fallback to localStorage only
    if (typeof window !== 'undefined') {
      try {
        const savedProperties = localStorage.getItem(LOCALSTORAGE_KEY);
        const properties = savedProperties ? JSON.parse(savedProperties) : [];
        
        const updatedProperties = properties.map((p: Property) => 
          p.id === property.id ? property : p
        );
        
        if (!updatedProperties.find((p: Property) => p.id === property.id)) {
          updatedProperties.push(property);
        }
        
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedProperties));
        console.log(`📱 Property saved to localStorage fallback`);
        
        return property;
      } catch (storageError) {
        console.error('localStorage fallback error:', storageError);
        throw new Error('Failed to save property to both Firebase and localStorage');
      }
    }
    
    throw new Error('Failed to save property - no storage available');
  }
};

// Update property in Firebase
export const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<Property> => {
  try {
    console.log(`🔄 Updating property ${propertyId} in Firebase...`);
    
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    
    await updateDoc(doc(db, PROPERTIES_COLLECTION, propertyId), updateData);
    
    const updatedProperty = await getPropertyById(propertyId);
    if (!updatedProperty) {
      throw new Error('Property not found after update');
    }
    
    console.log(`✅ Property updated successfully`);
    return updatedProperty;
  } catch (error) {
    handleFirebaseError(error, 'update property');
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedProperties = localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedProperties) {
          const properties = JSON.parse(savedProperties);
          const updatedProperties = properties.map((p: Property) => 
            p.id === propertyId ? { ...p, ...updates, updatedAt: new Date() } : p
          );
          
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedProperties));
          
          const updatedProperty = updatedProperties.find((p: Property) => p.id === propertyId);
          if (updatedProperty) {
            return updatedProperty;
          }
        }
      } catch (storageError) {
        console.error('localStorage fallback error:', storageError);
      }
    }
    
    throw new Error('Failed to update property');
  }
};

// Delete property from Firebase
export const deleteProperty = async (propertyId: string): Promise<void> => {
  try {
    console.log(`🗑️ Deleting property ${propertyId} from Firebase...`);
    
    await deleteDoc(doc(db, PROPERTIES_COLLECTION, propertyId));
    
    console.log(`✅ Property deleted from Firebase successfully`);
    
    // Also remove from localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedProperties = localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedProperties) {
          const properties = JSON.parse(savedProperties);
          const updatedProperties = properties.filter((p: Property) => p.id !== propertyId);
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedProperties));
        }
      } catch (storageError) {
        console.error('localStorage cleanup error:', storageError);
      }
    }
  } catch (error) {
    handleFirebaseError(error, 'delete property');
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedProperties = localStorage.getItem(LOCALSTORAGE_KEY);
        if (savedProperties) {
          const properties = JSON.parse(savedProperties);
          const updatedProperties = properties.filter((p: Property) => p.id !== propertyId);
          localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(updatedProperties));
          console.log(`📱 Property deleted from localStorage fallback`);
          return;
        }
      } catch (storageError) {
        console.error('localStorage fallback error:', storageError);
      }
    }
    
    throw new Error('Failed to delete property');
  }
};

// Initialize default properties in Firebase (run once)
export const initializeDefaultProperties = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing default properties in Firebase...');
    
    // Check if properties already exist
    const existingProperties = await getAllProperties();
    if (existingProperties.length > 0) {
      console.log('📦 Properties already exist in Firebase, skipping initialization');
      return;
    }
    
    // Save initial properties to Firebase
    for (const property of initialProperties) {
      await saveProperty(property);
    }
    
    console.log(`✅ Initialized ${initialProperties.length} default properties in Firebase`);
  } catch (error) {
    handleFirebaseError(error, 'initialize properties');
    console.log('📱 Default properties will be available through localStorage fallback');
  }
};

// Listen for real-time property updates
export const subscribeToProperties = (callback: (properties: Property[]) => void): (() => void) => {
  try {
    console.log('🔄 Setting up real-time property updates...');
    
    const propertiesCollection = collection(db, PROPERTIES_COLLECTION);
    const propertiesQuery = query(propertiesCollection, orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(propertiesQuery, (snapshot) => {
      const properties = snapshot.docs.map(convertFirestoreToProperty);
      console.log(`🔄 Real-time update: ${properties.length} properties`);
      
      // Update localStorage for offline access
      if (typeof window !== 'undefined') {
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(properties));
      }
      
      callback(properties);
    }, (error) => {
      handleFirebaseError(error, 'real-time properties');
      // Fallback to localStorage
      if (typeof window !== 'undefined') {
        try {
          const savedProperties = localStorage.getItem(LOCALSTORAGE_KEY);
          if (savedProperties) {
            const properties = JSON.parse(savedProperties).map((property: any) => ({
              ...property,
              createdAt: new Date(property.createdAt),
              updatedAt: new Date(property.updatedAt)
            }));
            callback(properties);
          }
        } catch (storageError) {
          console.error('localStorage fallback error:', storageError);
          callback(initialProperties);
        }
      } else {
        callback(initialProperties);
      }
    });
    
    return unsubscribe;
  } catch (error) {
    handleFirebaseError(error, 'subscribe to properties');
    // Return a no-op function if Firebase fails
    return () => {};
  }
};

// Get property statistics
export const getPropertyStatistics = async () => {
  try {
    const properties = await getAllProperties();
    const totalProperties = properties.length;
    const availableProperties = properties.filter(p => p.availability === 'available').length;
    const occupiedProperties = properties.filter(p => p.availability === 'occupied').length;
    const maintenanceProperties = properties.filter(p => p.availability === 'maintenance').length;
    const totalPotentialRevenue = properties.reduce((sum, p) => sum + p.rent, 0);
    
    return {
      totalProperties,
      availableProperties,
      occupiedProperties,
      maintenanceProperties,
      totalPotentialRevenue
    };
  } catch (error) {
    console.error('Error getting property statistics:', error);
    return {
      totalProperties: 0,
      availableProperties: 0,
      occupiedProperties: 0,
      maintenanceProperties: 0,
      totalPotentialRevenue: 0
    };
  }
};

// Clear all properties (admin function)
export const clearAllProperties = async (): Promise<void> => {
  try {
    console.log('🧹 Clearing all properties from Firebase...');
    
    const properties = await getAllProperties();
    
    // Delete all properties from Firebase
    for (const property of properties) {
      await deleteProperty(property.id);
    }
    
    console.log('✅ All properties cleared from Firebase');
  } catch (error) {
    handleFirebaseError(error, 'clear all properties');
    
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCALSTORAGE_KEY);
      console.log('📱 All properties cleared from localStorage fallback');
    }
  }
};

// Export localStorage key for compatibility
export { LOCALSTORAGE_KEY }; 