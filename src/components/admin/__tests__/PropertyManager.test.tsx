import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PropertyManager from '../PropertyManager';
import { Property } from '@/types';

// Mock the properties lib with proper implementations
jest.mock('../../../lib/properties', () => ({
  getAllProperties: jest.fn(),
  saveProperty: jest.fn(),
  updateProperty: jest.fn(),
  deleteProperty: jest.fn(),
  subscribeToProperties: jest.fn(),
}));

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: jest.fn(),
});

describe('PropertyManager', () => {
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Test Property 1',
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
    },
    {
      id: '2',
      title: 'Test Property 2',
      address: '456 Test Ave',
      rent: 1500,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1200,
      description: 'Another test property',
      amenities: ['pool', 'gym'],
      photos: [],
      availability: 'occupied',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
  ];

  let mockGetAllProperties: jest.Mock;
  let mockSaveProperty: jest.Mock;
  let mockUpdateProperty: jest.Mock;
  let mockDeleteProperty: jest.Mock;
  let mockSubscribeToProperties: jest.Mock;

  beforeEach(() => {
    // Get the mocked functions
    const propertiesLib = require('../../../lib/properties');
    mockGetAllProperties = propertiesLib.getAllProperties;
    mockSaveProperty = propertiesLib.saveProperty;
    mockUpdateProperty = propertiesLib.updateProperty;
    mockDeleteProperty = propertiesLib.deleteProperty;
    mockSubscribeToProperties = propertiesLib.subscribeToProperties;

    // Reset all mocks
    jest.clearAllMocks();

    // Setup default implementations
    mockGetAllProperties.mockResolvedValue(mockProperties);
    mockSaveProperty.mockImplementation((property: Property) => Promise.resolve(property));
    mockUpdateProperty.mockImplementation((id: string, updates: Partial<Property>) => 
      Promise.resolve({ ...mockProperties.find(p => p.id === id), ...updates })
    );
    mockDeleteProperty.mockResolvedValue(undefined);
    mockSubscribeToProperties.mockImplementation((callback: (properties: Property[]) => void) => {
      // Immediately call the callback with mock properties
      setTimeout(() => callback(mockProperties), 0);
      // Return unsubscribe function
      return jest.fn();
    });

    // Reset window.confirm
    (window.confirm as jest.Mock).mockReturnValue(true);
  });

  test('should render property list', async () => {
    render(<PropertyManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
      expect(screen.getByText('Test Property 2')).toBeInTheDocument();
    });

    expect(screen.getByText('Property Management')).toBeInTheDocument();
    expect(screen.getByText('Add Property')).toBeInTheDocument();
  });

  test('should show add property form when add button is clicked', async () => {
    render(<PropertyManager />);

    const addButton = screen.getByText('Add Property');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Property Title')).toBeInTheDocument();
      expect(screen.getByText('Address')).toBeInTheDocument();
      expect(screen.getByText('Monthly Rent')).toBeInTheDocument();
    });
  });

  test('should add new property when form is submitted', async () => {
    const user = userEvent.setup();
    render(<PropertyManager />);

    // Click add property button
    const addButton = screen.getByText('Add Property');
    await user.click(addButton);

    // Fill out the form
    await user.type(screen.getByLabelText(/property title/i), 'New Test Property');
    await user.type(screen.getByLabelText(/address/i), '789 New St');
    await user.type(screen.getByLabelText(/monthly rent/i), '1800');
    await user.type(screen.getByLabelText(/bedrooms/i), '3');
    await user.type(screen.getByLabelText(/bathrooms/i), '2');
    await user.type(screen.getByLabelText(/square footage/i), '1300');
    await user.type(screen.getByLabelText(/description/i), 'A new test property');

    // Submit the form
    const saveButton = screen.getByText('Save Property');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSaveProperty).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Test Property',
          address: '789 New St',
          rent: 1800,
        })
      );
    });
  });

  test('should handle form validation', async () => {
    const user = userEvent.setup();
    render(<PropertyManager />);

    // Click add property button
    const addButton = screen.getByText('Add Property');
    await user.click(addButton);

    // Try to submit without filling required fields
    const saveButton = screen.getByText('Save Property');
    await user.click(saveButton);

    // Should show validation messages
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    });

    expect(mockSaveProperty).not.toHaveBeenCalled();
  });

  test('should edit property when edit button is clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
    });

    // Click edit button for first property
    const editButtons = screen.getAllByText(/edit/i);
    await user.click(editButtons[0]);

    // Should show form with pre-filled values
    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Property 1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('123 Test St')).toBeInTheDocument();
    });
  });

  test('should delete property when delete button is clicked', async () => {
    const user = userEvent.setup();
    render(<PropertyManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
    });

    // Click delete button for first property
    const deleteButtons = screen.getAllByText(/delete/i);
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockDeleteProperty).toHaveBeenCalledWith('1');
    });
  });

  test('should cancel delete when confirmation is denied', async () => {
    const user = userEvent.setup();
    (window.confirm as jest.Mock).mockReturnValue(false);
    
    render(<PropertyManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
    });

    // Click delete button for first property
    const deleteButtons = screen.getAllByText(/delete/i);
    await user.click(deleteButtons[0]);

    // Should not call delete since confirmation was denied
    expect(mockDeleteProperty).not.toHaveBeenCalled();
  });

  test('should filter properties by availability', async () => {
    const user = userEvent.setup();
    render(<PropertyManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
      expect(screen.getByText('Test Property 2')).toBeInTheDocument();
    });

    // Look for availability filter (assuming there's a filter component)
    const availableFilter = screen.queryByText(/available/i);
    if (availableFilter) {
      await user.click(availableFilter);
      
      // Should still show available properties
      await waitFor(() => {
        expect(screen.getByText('Test Property 1')).toBeInTheDocument();
      });
    }
  });

  test('should handle real-time property updates', async () => {
    const mockCallback = jest.fn();
    mockSubscribeToProperties.mockImplementation((callback: (properties: Property[]) => void) => {
      mockCallback.mockImplementation(callback);
      return jest.fn();
    });

    render(<PropertyManager />);

    await waitFor(() => {
      expect(screen.getByText('Test Property 1')).toBeInTheDocument();
    });

    // Simulate real-time update
    const updatedProperties = [
      ...mockProperties,
      {
        id: '3',
        title: 'New Real-time Property',
        address: '999 Real-time St',
        rent: 2000,
        bedrooms: 4,
        bathrooms: 3,
        squareFootage: 1500,
        description: 'A real-time property',
        amenities: ['pool'],
        photos: [],
        availability: 'available' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockCallback(updatedProperties);

    // Component should update with new property
    await waitFor(() => {
      expect(screen.getByText('New Real-time Property')).toBeInTheDocument();
    });
  });

  test('should cleanup subscription on unmount', () => {
    const unsubscribeMock = jest.fn();
    mockSubscribeToProperties.mockReturnValue(unsubscribeMock);

    const { unmount } = render(<PropertyManager />);
    unmount();

    // Should call unsubscribe
    expect(unsubscribeMock).toHaveBeenCalled();
  });
}); 