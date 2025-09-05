import { Property } from '@/types';

export const properties: Property[] = [
  {
    id: '1',
    title: 'Gold Street Studio Flat',
    address: 'Gold Street, Northampton, NN1 1RS',
    rent: 950,
    bedrooms: 0,
    bathrooms: 1,
    squareFootage: 450,
    description: 'Located in the vibrant centre of Northampton, this stylish studio flat offers contemporary living just moments from shops, cafes, and excellent transport links. Finished to a high standard throughout, the property features a modern open-plan living room and kitchen with appliances, a bathroom with sleek shower enclosure, and a welcoming hallway. Offered unfurnished, this studio is perfect for professionals or individuals seeking a low-maintenance home in a prime location.',
    amenities: [
      'Modern open-plan living',
      'Kitchen with appliances',
      'Bathroom with shower',
      'Unfurnished',
      'Central location',
      'Close to amenities',
      'Excellent transport links'
    ],
    photos: [
      '/properties/1/main.jpg',
      '/properties/1/1.jpg',
      '/properties/1/2.jpg',
      '/properties/1/3.jpg',
      '/properties/1/4.jpg',
      '/properties/1/5.jpg',
      '/properties/1/floorplan.png'
    ],
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
    description: 'Charming studio apartment on Talbot Road, perfectly situated in a desirable area of Northampton. This well-maintained property features modern amenities and is ideal for professionals or students seeking affordable, quality accommodation. Unfurnished and ready for immediate occupancy.',
    amenities: [
      'Unfurnished',
      'Central heating',
      'Double glazing',
      'Shared garden',
      'On-street parking',
      'Close to transport links',
      'Local amenities nearby'
    ],
    photos: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80'
    ],
    availability: 'sold',
    epcRating: 'D',
    councilTaxBand: 'A',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]; 