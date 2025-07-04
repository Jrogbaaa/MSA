import { Property } from '@/types';

export const properties: Property[] = [
  {
    id: '1',
    title: 'Stylish Studio Flat - Gold Street',
    address: 'Gold Street, Northampton, NN1 1RS',
    rent: 850, // Estimated UK studio rent for Northampton
    bedrooms: 0, // Studio
    bathrooms: 1,
    squareFootage: 450, // Typical studio size
    description: 'Located in the vibrant centre of Northampton, this stylish studio flat offers contemporary living just moments from shops, cafes, and excellent transport links. Finished to a high standard throughout, the property features a modern open-plan living room and kitchen with appliances, a bathroom with sleek shower enclosure, and a welcoming hallway. Offered unfurnished, this studio is perfect for professionals or individuals seeking a low-maintenance home in a prime location.',
    amenities: ['Unfurnished', 'Modern Kitchen', 'Shower Enclosure', 'City Centre Location', 'Transport Links'],
    photos: [
      '/properties/1/main.jpg',
      '/properties/1/1.jpg',
      '/properties/1/2.jpg',
      '/properties/1/3.jpg',
      '/properties/1/4.jpg',
      '/properties/1/5.jpg'
    ],
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // Keep existing mock properties as examples
  {
    id: '2',
    title: 'Modern City Centre Flat',
    address: '15 King Street, Manchester City Centre, M2 4LQ',
    rent: 1800,
    bedrooms: 2,
    bathrooms: 2,
    squareFootage: 1200,
    description: 'Stunning modern flat with city views, hardwood floors, and high-end appliances.',
    amenities: ['Gym', 'Roof Terrace', 'Secure Parking', 'Pet Friendly'],
    photos: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
    ],
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Charming Garden Flat',
    address: '78 Victoria Road, Birmingham, B16 9PA',
    rent: 1200,
    bedrooms: 1,
    bathrooms: 1,
    squareFootage: 800,
    description: 'Lovely garden flat with private patio and newly refurbished kitchen.',
    amenities: ['Private Garden', 'Off-Street Parking', 'Communal Laundry'],
    photos: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
    ],
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Luxury Penthouse Apartment',
    address: '42 Canary Wharf, London, E14 5AB',
    rent: 3500,
    bedrooms: 3,
    bathrooms: 2,
    squareFootage: 1500,
    description: 'Exceptional penthouse with panoramic Thames views and premium amenities.',
    amenities: ['Concierge Service', 'Swimming Pool', 'Gym', 'Underground Parking', 'Roof Terrace'],
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
    ],
    availability: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]; 