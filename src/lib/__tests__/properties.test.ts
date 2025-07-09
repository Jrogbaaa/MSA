// Mock Firebase functions before any imports
jest.mock('../firebase', () => ({
  db: {},
  checkFirestoreConnection: jest.fn(),
  getConnectionStatus: jest.fn(),
  collection: jest.fn(),
  getDocs: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock the data/properties import
jest.mock('../../data/properties', () => ({
  properties: [
    {
      id: 'initial-1',
      title: 'Initial Property',
      address: '123 Initial St',
      rent: 1000,
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 800,
      description: 'Initial property for testing',
      amenities: [],
      photos: [],
      availability: 'available',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    }
  ]
}));

import { 
  getAllProperties, 
  getPropertyById, 
  saveProperty, 
  updateProperty, 
  deleteProperty, 
  subscribeToProperties, 
  clearAllProperties
} from '../properties';
import { Property } from '@/types';

// Setup Firebase mock functions
const mockFirebaseFunctions = () => {
  const firebase = require('../firebase');
  
  // Reset all mocks
  Object.keys(firebase).forEach(key => {
    if (jest.isMockFunction(firebase[key])) {
      firebase[key].mockReset();
    }
  });
  
  // Set default implementations
  firebase.checkFirestoreConnection.mockResolvedValue(true);
  firebase.getConnectionStatus.mockReturnValue({ healthy: true, lastCheck: Date.now() });
  firebase.collection.mockReturnValue({});
  firebase.query.mockReturnValue({});
  firebase.orderBy.mockReturnValue({});
  firebase.doc.mockReturnValue({});
  
  return firebase;
};

describe('Property Management Functions', () => {
  let localStorageMock: any;
  let consoleLogSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // Setup localStorage mock
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    // Setup console spies
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Reset Firebase mocks
    mockFirebaseFunctions();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // Test data
  const mockFirebaseProperties: Property[] = [
    {
      id: 'firebase-1',
      title: 'Firebase Property 1',
      address: '123 Firebase St',
      rent: 1200,
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 900,
      description: 'A Firebase property',
      amenities: ['parking'],
      photos: [],
      availability: 'available',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'firebase-2',
      title: 'Firebase Property 2',
      address: '456 Firebase Ave',
      rent: 1500,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1200,
      description: 'Another Firebase property',
      amenities: ['pool'],
      photos: [],
      availability: 'available',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  describe('getAllProperties', () => {
    test('should fetch properties from Firebase successfully', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDocs.mockResolvedValue({
        docs: mockFirebaseProperties.map(prop => ({
          id: prop.id,
          data: () => ({ ...prop, id: undefined }),
        }))
      });

      const properties = await getAllProperties();

      expect(properties).toHaveLength(2);
      expect(properties[0].title).toBe('Firebase Property 1');
      expect(properties[1].title).toBe('Firebase Property 2');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'msa_admin_properties',
        expect.stringContaining('Firebase Property')
      );
    });

    test('should fallback to localStorage when Firebase fails', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDocs.mockRejectedValue(new Error('Firebase connection error'));
      
      const mockLocalStorageProperties = [
        { 
          id: '1', 
          title: 'Local Property 1', 
          address: '123 Local St', 
          rent: 1000,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        { 
          id: '2', 
          title: 'Local Property 2', 
          address: '456 Local Ave', 
          rent: 1200,
          createdAt: '2024-01-02T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z'
        },
      ];
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLocalStorageProperties));

      const properties = await getAllProperties();

      expect(properties).toHaveLength(2);
      expect(properties[0].title).toBe('Local Property 1');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Firebase')
      );
    });

    test('should handle corrupted localStorage data', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDocs.mockRejectedValue(new Error('Firebase error'));
      localStorageMock.getItem.mockReturnValue('invalid json');

      const properties = await getAllProperties();

      // Should fallback to initial properties
      expect(properties).toHaveLength(1);
      expect(properties[0].title).toBe('Initial Property');
    });

    test('should use initial properties as final fallback', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDocs.mockRejectedValue(new Error('Firebase error'));
      localStorageMock.getItem.mockReturnValue(null);

      const properties = await getAllProperties();

      expect(properties).toHaveLength(1);
      expect(properties[0].title).toBe('Initial Property');
      expect(consoleLogSpy).toHaveBeenCalledWith('📦 Using initial properties as final fallback');
    });

    test('should handle empty Firebase response', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDocs.mockResolvedValue({ docs: [] });
      localStorageMock.getItem.mockReturnValue(null);

      const properties = await getAllProperties();

      // Should fallback to initial properties when Firebase returns empty
      expect(properties).toHaveLength(1);
      expect(properties[0].title).toBe('Initial Property');
    });
  });

  describe('getPropertyById', () => {
    const mockProperty: Property = {
      id: '123',
      title: 'Test Property',
      address: '123 Test St',
      rent: 1200,
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 900,
      description: 'A test property',
      amenities: ['parking'],
      photos: [],
      availability: 'available',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    test('should fetch property by ID from Firebase', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDoc.mockResolvedValue({
        exists: () => true,
        id: '123',
        data: () => ({ ...mockProperty, id: undefined }),
      });

      const property = await getPropertyById('123');

      expect(property).toBeTruthy();
      expect(property?.title).toBe('Test Property');
      expect(property?.id).toBe('123');
    });

    test('should return null for non-existent property in Firebase', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDoc.mockResolvedValue({
        exists: () => false,
      });

      const property = await getPropertyById('nonexistent');

      expect(property).toBeNull();
    });

    test('should fallback to localStorage when Firebase fails', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDoc.mockRejectedValue(new Error('Firebase error'));
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify([{
        ...mockProperty,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      }]));

      const property = await getPropertyById('123');

      expect(property).toBeTruthy();
      expect(property?.title).toBe('Test Property');
    });

    test('should handle invalid ID parameter', async () => {
      const property = await getPropertyById('');

      expect(property).toBeNull();
    });
  });

  describe('saveProperty', () => {
    const mockProperty: Property = {
      id: '1',
      title: 'New Property',
      address: '123 New St',
      rent: 1200,
      bedrooms: 2,
      bathrooms: 1,
      squareFootage: 900,
      description: 'A new property',
      amenities: ['parking'],
      photos: [],
      availability: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test('should save property to Firebase successfully', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.setDoc.mockResolvedValue(undefined);
      firebase.getDocs.mockResolvedValue({ docs: [] }); // For getAllProperties call

      const savedProperty = await saveProperty(mockProperty);

      expect(savedProperty).toBeTruthy();
      expect(savedProperty.title).toBe('New Property');
      expect(firebase.setDoc).toHaveBeenCalled();
    });

    test('should fallback to localStorage when Firebase fails', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.setDoc.mockRejectedValue(new Error('Firebase connection error'));

      const savedProperty = await saveProperty(mockProperty);

      expect(savedProperty).toBeTruthy();
      expect(savedProperty.title).toBe('New Property');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'msa_admin_properties',
        expect.stringContaining('New Property')
      );
    });

    test('should generate ID if not provided', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.setDoc.mockRejectedValue(new Error('Firebase error'));
      
      const propertyWithoutId = { ...mockProperty, id: '' };

      const savedProperty = await saveProperty(propertyWithoutId);

      expect(savedProperty.id).toBeTruthy();
      expect(savedProperty.id).not.toBe('');
    });
  });

  describe('updateProperty', () => {
    test('should update property in Firebase', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.updateDoc.mockResolvedValue(undefined);
      firebase.getDoc.mockResolvedValue({
        exists: () => true,
        id: '123',
        data: () => ({
          title: 'Updated Property',
          address: '123 Test St',
          rent: 1300,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date(),
        }),
      });

      const updatedProperty = await updateProperty('123', { rent: 1300, title: 'Updated Property' });

      expect(updatedProperty.rent).toBe(1300);
      expect(updatedProperty.title).toBe('Updated Property');
      expect(firebase.updateDoc).toHaveBeenCalled();
    });

    test('should fallback to localStorage when Firebase fails', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.updateDoc.mockRejectedValue(new Error('Firebase error'));
      
      const existingProperty = {
        id: '123',
        title: 'Original Property',
        rent: 1200,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z'
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify([existingProperty]));

      const updatedProperty = await updateProperty('123', { rent: 1300 });

      expect(updatedProperty.rent).toBe(1300);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('deleteProperty', () => {
    test('should delete property from Firebase', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.deleteDoc.mockResolvedValue(undefined);

      await deleteProperty('123');

      expect(firebase.deleteDoc).toHaveBeenCalled();
    });

    test('should fallback to localStorage when Firebase fails', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.deleteDoc.mockRejectedValue(new Error('Firebase error'));
      
      const existingProperties = [
        { id: '123', title: 'Property to Delete' },
        { id: '456', title: 'Property to Keep' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingProperties));

      await deleteProperty('123');

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'msa_admin_properties',
        expect.not.stringContaining('Property to Delete')
      );
    });
  });

  describe('subscribeToProperties', () => {
    test('should set up Firebase real-time subscription', () => {
      const firebase = mockFirebaseFunctions();
      const unsubscribeMock = jest.fn();
      firebase.onSnapshot.mockReturnValue(unsubscribeMock);
      
      const callback = jest.fn();
      const unsubscribe = subscribeToProperties(callback);

      expect(firebase.onSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
      
      // Test unsubscribe
      unsubscribe();
      expect(unsubscribeMock).toHaveBeenCalled();
    });

    test('should handle subscription errors gracefully', () => {
      const firebase = mockFirebaseFunctions();
      firebase.onSnapshot.mockImplementation(() => {
        throw new Error('Subscription error');
      });
      
      const callback = jest.fn();
      const unsubscribe = subscribeToProperties(callback);

      // Should return a valid unsubscribe function even on error
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('clearAllProperties', () => {
    test('should clear all properties from Firebase and localStorage', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDocs.mockResolvedValue({
        docs: [
          { id: '1', ref: {} },
          { id: '2', ref: {} },
        ]
      });
      firebase.deleteDoc.mockResolvedValue(undefined);

      await clearAllProperties();

      expect(firebase.deleteDoc).toHaveBeenCalledTimes(2);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('msa_admin_properties');
    });

    test('should handle Firebase errors during clear operation', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.getDocs.mockRejectedValue(new Error('Firebase error'));

      await clearAllProperties();

      // Should still clear localStorage even if Firebase fails
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('msa_admin_properties');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle network connectivity issues', async () => {
      const firebase = mockFirebaseFunctions();
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';
      firebase.getDocs.mockRejectedValue(networkError);

      const properties = await getAllProperties();

      expect(properties).toBeTruthy();
    });

    test('should handle localStorage quota exceeded', async () => {
      const firebase = mockFirebaseFunctions();
      firebase.setDoc.mockRejectedValue(new Error('Firebase error'));
      
      const quotaError = new Error('QuotaExceededError');
      quotaError.name = 'QuotaExceededError';
      localStorageMock.setItem.mockImplementation(() => {
        throw quotaError;
      });

      const mockProperty: Property = {
        id: '1',
        title: 'Large Property',
        address: '123 Test St',
        rent: 1200,
        bedrooms: 2,
        bathrooms: 1,
        squareFootage: 900,
        description: 'A'.repeat(10000), // Large description
        amenities: [],
        photos: [],
        availability: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Should throw an error when both Firebase and localStorage fail
      await expect(saveProperty(mockProperty)).rejects.toThrow();
    });
  });
}); 