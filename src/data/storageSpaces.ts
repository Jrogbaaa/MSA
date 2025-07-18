import { StorageSpace } from '@/types';

export const storageSpaces: StorageSpace[] = [
  {
    id: '1',
    title: 'Small Storage Unit',
    size: '5x5 ft',
    squareFootage: 25,
    monthlyRate: 8.75,
    description: 'Perfect for storing seasonal items, sports equipment, or small furniture pieces. Climate-controlled and secure.',
    features: [
      'Climate Controlled',
      '24/7 Security',
      'CCTV Monitoring',
      'Easy Access',
      'Ground Floor',
      'Drive-up Access'
    ],
    photos: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    availability: 'available',
    unitCount: 12,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2', 
    title: 'Medium Storage Unit',
    size: '10x10 ft',
    squareFootage: 100,
    monthlyRate: 16.50,
    description: 'Ideal for storing furniture from a one-bedroom apartment or home office equipment. Spacious and accessible.',
    features: [
      'Climate Controlled',
      '24/7 Security', 
      'CCTV Monitoring',
      'Easy Access',
      'Ground Floor',
      'Drive-up Access',
      'Loading Bay Access'
    ],
    photos: [
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    availability: 'available',
    unitCount: 8,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '3',
    title: 'Large Storage Unit', 
    size: '10x20 ft',
    squareFootage: 200,
    monthlyRate: 29.99,
    description: 'Suitable for storing contents of a 2-3 bedroom home, vehicles, or commercial inventory. Maximum security and convenience.',
    features: [
      'Climate Controlled',
      '24/7 Security',
      'CCTV Monitoring', 
      'Easy Access',
      'Ground Floor',
      'Drive-up Access',
      'Loading Bay Access',
      'High Ceilings',
      'Vehicle Storage'
    ],
    photos: [
      'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    availability: 'available',
    unitCount: 5,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '4',
    title: 'Extra Large Storage Unit',
    size: '20x20 ft', 
    squareFootage: 400,
    monthlyRate: 55.00,
    description: 'Premium storage solution for large homes, commercial use, or vehicle collection. Ultimate space and security.',
    features: [
      'Climate Controlled',
      '24/7 Security',
      'CCTV Monitoring',
      'Easy Access', 
      'Ground Floor',
      'Drive-up Access',
      'Loading Bay Access',
      'High Ceilings',
      'Vehicle Storage',
      'Commercial Access',
      'Premium Location'
    ],
    photos: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    ],
    availability: 'available',
    unitCount: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

export default storageSpaces; 