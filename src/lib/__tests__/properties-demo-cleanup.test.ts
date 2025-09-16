// Mock Firebase functions first
jest.mock('firebase/firestore', () => ({
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

// Mock the firebase config
jest.mock('../firebase', () => ({
  db: {},
  checkFirestoreConnection: jest.fn().mockResolvedValue(true),
  getConnectionStatus: jest.fn().mockReturnValue(true),
  attemptFirestoreRecovery: jest.fn().mockResolvedValue(true),
}));

// Mock the initial properties data
jest.mock('../../data/properties', () => ({
  properties: [
    {
      id: '1',
      title: 'Gold Street Studio Flat',
      address: 'Gold Street, Northampton, NN1 1RS',
      rent: 950,
      bedrooms: 0,
      bathrooms: 1,
      squareFootage: 450,
      description: 'A real property for production',
      amenities: ['Modern kitchen', 'Central heating'],
      photos: ['/properties/1/main.jpg'],
      availability: 'sold',
      epcRating: 'C',
      councilTaxBand: 'B',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '5',
      title: 'Talbot Road Studio Apartment',
      address: 'Talbot Road, Northampton, NN1 4JB',
      rent: 725,
      bedrooms: 0,
      bathrooms: 1,
      squareFootage: 380,
      description: 'Another real property for production',
      amenities: ['Unfurnished', 'Central heating'],
      photos: ['https://example.com/photo.jpg'],
      availability: 'sold',
      epcRating: 'D',
      councilTaxBand: 'A',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ]
}));

// Mock the properties module functions
jest.mock('../properties', () => ({
  ...jest.requireActual('../properties'),
  getAllProperties: jest.fn(),
  updateProperty: jest.fn(),
  deleteProperty: jest.fn(),
  saveProperty: jest.fn(),
}));

import { initializeDefaultProperties } from '../properties';
import * as propertiesModule from '../properties';

describe('🧹 Demo Property Cleanup Logic Tests', () => {
  const mockGetAllProperties = propertiesModule.getAllProperties as jest.Mock;
  const mockUpdateProperty = propertiesModule.updateProperty as jest.Mock;
  const mockDeleteProperty = propertiesModule.deleteProperty as jest.Mock;
  const mockSaveProperty = propertiesModule.saveProperty as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console methods to avoid noise in tests
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('🗑️ Demo Property Detection and Removal', () => {
    test('should detect and remove demo properties with IDs 2, 3, 4', async () => {
      const existingProperties = [
        // Real properties
        {
          id: '1',
          title: 'Gold Street Studio Flat',
          availability: 'sold',
          rent: 950,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Demo properties that should be removed
        {
          id: '2',
          title: 'Modern City Centre Flat',
          availability: 'available',
          rent: 1800,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'Charming Garden Flat',
          availability: 'available',
          rent: 1200,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '4',
          title: 'Luxury Penthouse Apartment',
          availability: 'available',
          rent: 3500,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Another real property
        {
          id: '5',
          title: 'Talbot Road Studio Apartment',
          availability: 'sold',
          rent: 725,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mockGetAllProperties.mockResolvedValue(existingProperties);
      mockDeleteProperty.mockResolvedValue(undefined);

      await initializeDefaultProperties();

      // Verify demo properties were deleted
      expect(mockDeleteProperty).toHaveBeenCalledTimes(3);
      expect(mockDeleteProperty).toHaveBeenCalledWith('2');
      expect(mockDeleteProperty).toHaveBeenCalledWith('3');
      expect(mockDeleteProperty).toHaveBeenCalledWith('4');

      // Verify console logs for demo property removal
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Removing 3 demo properties from Firebase')
      );
    });

    test('should not remove properties with non-demo IDs', async () => {
      const existingProperties = [
        {
          id: '1',
          title: 'Gold Street Studio Flat',
          availability: 'sold',
          rent: 950,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '5',
          title: 'Talbot Road Studio Apartment',
          availability: 'sold',
          rent: 725,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mockGetAllProperties.mockResolvedValue(existingProperties);

      await initializeDefaultProperties();

      // Verify no properties were deleted (no demo properties present)
      expect(mockDeleteProperty).not.toHaveBeenCalled();
    });
  });

  describe('🔄 Property Status and Rent Updates', () => {
    test('should update existing properties with new sold status and rent', async () => {
      const existingProperties = [
        {
          id: '1',
          title: 'Gold Street Studio Flat',
          availability: 'available', // Should be updated to 'sold'
          rent: 825, // Should be updated to 950
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mockGetAllProperties.mockResolvedValue(existingProperties);
      mockUpdateProperty.mockResolvedValue({});

      await initializeDefaultProperties();

      // Verify properties were updated with correct status and rent
      expect(mockUpdateProperty).toHaveBeenCalledWith('1', {
        availability: 'sold',
        rent: 950
      });
    });

    test('should not update properties that already have correct status and rent', async () => {
      const existingProperties = [
        {
          id: '1',
          title: 'Gold Street Studio Flat',
          availability: 'sold', // Already correct
          rent: 950, // Already correct
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];

      mockGetAllProperties.mockResolvedValue(existingProperties);

      await initializeDefaultProperties();

      // Verify no updates were made
      expect(mockUpdateProperty).not.toHaveBeenCalled();
    });
  });

  describe('🚀 First Time Initialization', () => {
    test('should initialize all properties when Firebase is empty', async () => {
      mockGetAllProperties.mockResolvedValue([]); // Empty Firebase
      mockSaveProperty.mockResolvedValue({});

      await initializeDefaultProperties();

      // Verify properties were saved (should be 2 based on our mock)
      expect(mockSaveProperty).toHaveBeenCalledTimes(2);
    });
  });

  describe('🛡️ Production Safety Tests', () => {
    test('should only target specific demo property IDs', async () => {
      const existingProperties = [
        // These should be removed
        { id: '2', title: 'Demo Property 2', availability: 'available' },
        { id: '3', title: 'Demo Property 3', availability: 'available' },
        { id: '4', title: 'Demo Property 4', availability: 'available' },
        // These should NOT be removed
        { id: '1', title: 'Real Property 1', availability: 'available' },
        { id: '5', title: 'Real Property 5', availability: 'available' },
        { id: '6', title: 'Real Property 6', availability: 'available' },
      ];

      mockGetAllProperties.mockResolvedValue(existingProperties);
      mockDeleteProperty.mockResolvedValue(undefined);

      await initializeDefaultProperties();

      // Verify only demo properties were deleted
      expect(mockDeleteProperty).toHaveBeenCalledTimes(3);
      expect(mockDeleteProperty).toHaveBeenCalledWith('2');
      expect(mockDeleteProperty).toHaveBeenCalledWith('3');
      expect(mockDeleteProperty).toHaveBeenCalledWith('4');

      // Verify real properties were not deleted
      expect(mockDeleteProperty).not.toHaveBeenCalledWith('1');
      expect(mockDeleteProperty).not.toHaveBeenCalledWith('5');
      expect(mockDeleteProperty).not.toHaveBeenCalledWith('6');
    });
  });
});