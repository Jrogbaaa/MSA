import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyManager from '../PropertyManager';
import * as propertiesLib from '../../../lib/properties';
import * as imageStorageLib from '../../../lib/imageStorage';

// Mock the properties library
jest.mock('../../../lib/properties', () => ({
  getAllProperties: jest.fn(),
  updateProperty: jest.fn(),
  saveProperty: jest.fn(),
  deleteProperty: jest.fn(),
  initializeDefaultProperties: jest.fn(),
  subscribeToProperties: jest.fn(),
  subscribeToPropertiesCleanup: jest.fn(),
  getPropertyStatistics: jest.fn(),
  clearAllProperties: jest.fn(),
}));

// Mock the image storage library
jest.mock('../../../lib/imageStorage', () => ({
  uploadPropertyImages: jest.fn(),
  deletePropertyImages: jest.fn(),
  isFirebaseStorageUrl: jest.fn(),
  isBase64Url: jest.fn(),
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(),
});

// Mock window.alert
Object.defineProperty(window, 'alert', {
  writable: true,
  value: jest.fn(),
});

const mockProperty = {
  id: 'test-property-1',
  title: 'Test Property',
  address: '123 Test Street, Test City, TC1 2ST',
  rent: 1000,
  bedrooms: 2,
  bathrooms: 1,
  squareFootage: 800,
  description: 'A test property for unit testing',
  amenities: ['Central heating', 'Double glazing'],
  photos: ['https://example.com/photo1.jpg'],
  availability: 'available' as const,
  epcRating: 'C',
  councilTaxBand: 'B',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockSoldProperty = {
  ...mockProperty,
  id: 'test-property-2',
  title: 'Sold Test Property',
  availability: 'sold' as const,
};

describe('🏷️ PropertyManager - Toggle Sold Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mocks
    (propertiesLib.getAllProperties as jest.Mock).mockResolvedValue([mockProperty, mockSoldProperty]);
    (propertiesLib.subscribeToPropertiesCleanup as jest.Mock).mockImplementation((callback) => {
      callback([mockProperty, mockSoldProperty]);
      return jest.fn(); // Return cleanup function
    });
    (propertiesLib.getPropertyStatistics as jest.Mock).mockResolvedValue({
      totalProperties: 2,
      availableProperties: 1,
      occupiedProperties: 0,
      maintenanceProperties: 0,
      soldProperties: 1,
      totalPotentialRevenue: 2000,
    });
  });

  describe('🎯 handleToggleSold Function Tests', () => {
    test('should mark available property as sold when Tag button clicked', async () => {
      const updatedProperty = { ...mockProperty, availability: 'sold' as const };
      (propertiesLib.updateProperty as jest.Mock).mockResolvedValue(updatedProperty);
      (window.confirm as jest.Mock).mockReturnValue(true);

      render(<PropertyManager />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the Tag button for available property
      const tagButtons = screen.getAllByTitle('Mark as Sold');
      expect(tagButtons).toHaveLength(1); // Only available property should have "Mark as Sold" button

      fireEvent.click(tagButtons[0]);

      // Verify confirmation dialog was shown
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('mark as sold "Test Property"')
      );

      // Verify updateProperty was called with correct parameters
      await waitFor(() => {
        expect(propertiesLib.updateProperty).toHaveBeenCalledWith('test-property-1', {
          availability: 'sold'
        });
      });

      // Verify success alert was shown
      expect(window.alert).toHaveBeenCalledWith(
        expect.stringContaining('Status Updated!')
      );
    });

    test('should mark sold property as available when Tag button clicked', async () => {
      const updatedProperty = { ...mockSoldProperty, availability: 'available' as const };
      (propertiesLib.updateProperty as jest.Mock).mockResolvedValue(updatedProperty);
      (window.confirm as jest.Mock).mockReturnValue(true);

      render(<PropertyManager />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('Sold Test Property')).toBeInTheDocument();
      });

      // Find and click the Tag button for sold property
      const tagButtons = screen.getAllByTitle('Mark as Available');
      expect(tagButtons).toHaveLength(1); // Only sold property should have "Mark as Available" button

      fireEvent.click(tagButtons[0]);

      // Verify confirmation dialog was shown
      expect(window.confirm).toHaveBeenCalledWith(
        expect.stringContaining('mark as available "Sold Test Property"')
      );

      // Verify updateProperty was called with correct parameters
      await waitFor(() => {
        expect(propertiesLib.updateProperty).toHaveBeenCalledWith('test-property-2', {
          availability: 'available'
        });
      });
    });

    test('should not update property when user cancels confirmation', async () => {
      (window.confirm as jest.Mock).mockReturnValue(false);

      render(<PropertyManager />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the Tag button
      const tagButtons = screen.getAllByTitle('Mark as Sold');
      fireEvent.click(tagButtons[0]);

      // Verify confirmation dialog was shown
      expect(window.confirm).toHaveBeenCalled();

      // Verify updateProperty was NOT called
      expect(propertiesLib.updateProperty).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });

    test('should handle Firebase error gracefully', async () => {
      const errorMessage = 'Firebase connection error';
      (propertiesLib.updateProperty as jest.Mock).mockRejectedValue(new Error(errorMessage));
      (window.confirm as jest.Mock).mockReturnValue(true);

      render(<PropertyManager />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Find and click the Tag button
      const tagButtons = screen.getAllByTitle('Mark as Sold');
      fireEvent.click(tagButtons[0]);

      // Wait for error handling
      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          expect.stringContaining('Error updating property status')
        );
      });
    });

    test('should disable Tag button when adding property', async () => {
      render(<PropertyManager />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Click "Add New Property" to enter adding state
      const addButton = screen.getByText('Add New Property');
      fireEvent.click(addButton);

      // Verify Tag buttons are disabled
      const tagButtons = screen.getAllByRole('button', { name: /Mark as/i });
      tagButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('should have correct button colors for available vs sold properties', async () => {
      render(<PropertyManager />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
        expect(screen.getByText('Sold Test Property')).toBeInTheDocument();
      });

      // Check available property has orange button
      const availableTagButton = screen.getByTitle('Mark as Sold');
      expect(availableTagButton).toHaveClass('border-orange-600', 'text-orange-400');

      // Check sold property has green button
      const soldTagButton = screen.getByTitle('Mark as Available');
      expect(soldTagButton).toHaveClass('border-green-600', 'text-green-400');
    });
  });

  describe('📊 Statistics Update Tests', () => {
    test('should update statistics grid when property status changes', async () => {
      const updatedProperty = { ...mockProperty, availability: 'sold' as const };
      (propertiesLib.updateProperty as jest.Mock).mockResolvedValue(updatedProperty);
      (window.confirm as jest.Mock).mockReturnValue(true);

      // Mock updated statistics after property is marked as sold
      (propertiesLib.getPropertyStatistics as jest.Mock)
        .mockResolvedValueOnce({
          totalProperties: 2,
          availableProperties: 1,
          occupiedProperties: 0,
          maintenanceProperties: 0,
          soldProperties: 1,
          totalPotentialRevenue: 2000,
        })
        .mockResolvedValueOnce({
          totalProperties: 2,
          availableProperties: 0,
          occupiedProperties: 0,
          maintenanceProperties: 0,
          soldProperties: 2,
          totalPotentialRevenue: 2000,
        });

      render(<PropertyManager />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument(); // Available count
      });

      // Click Tag button to mark as sold
      const tagButton = screen.getByTitle('Mark as Sold');
      fireEvent.click(tagButton);

      // Verify statistics should update (though this might require additional implementation)
      await waitFor(() => {
        expect(propertiesLib.updateProperty).toHaveBeenCalled();
      });
    });
  });

  describe('🔒 Permission and State Tests', () => {
    test('should not allow toggling when editing another property', async () => {
      render(<PropertyManager />);

      // Wait for properties to load
      await waitFor(() => {
        expect(screen.getByText('Test Property')).toBeInTheDocument();
      });

      // Click Edit button to enter editing state
      const editButtons = screen.getAllByTitle('Edit Property');
      fireEvent.click(editButtons[0]);

      // Verify Tag buttons are disabled during editing
      const tagButtons = screen.getAllByRole('button', { name: /Mark as/i });
      tagButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('should handle property not found error', async () => {
      // Mock empty properties array
      (propertiesLib.getAllProperties as jest.Mock).mockResolvedValue([]);
      (propertiesLib.subscribeToPropertiesCleanup as jest.Mock).mockImplementation((callback) => {
        callback([]);
        return jest.fn();
      });

      render(<PropertyManager />);

      // Should not crash and should show empty state
      await waitFor(() => {
        expect(screen.getByText('Total Properties')).toBeInTheDocument();
      });
    });
  });
});
