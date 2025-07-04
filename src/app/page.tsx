'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Property, SearchFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for properties
const mockProperties: Property[] = [
  {
    id: '1',
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
    id: '2',
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
    id: '3',
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

export default function HomePage() {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    priceRange: [0, 4000],
    bedrooms: null,
    bathrooms: null,
    availability: 'available',
    searchTerm: '',
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);

  // Filter properties based on search criteria
  useEffect(() => {
    let filtered = properties.filter(property => {
      const matchesPrice = property.rent >= searchFilters.priceRange[0] && 
                          property.rent <= searchFilters.priceRange[1];
      const matchesBedrooms = searchFilters.bedrooms === null || 
                            property.bedrooms === searchFilters.bedrooms;
      const matchesBathrooms = searchFilters.bathrooms === null || 
                             property.bathrooms === searchFilters.bathrooms;
      const matchesAvailability = property.availability === searchFilters.availability;
      const matchesSearch = searchFilters.searchTerm === '' || 
                          property.title.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
                          property.address.toLowerCase().includes(searchFilters.searchTerm.toLowerCase());

      return matchesPrice && matchesBedrooms && matchesBathrooms && matchesAvailability && matchesSearch;
    });

    setFilteredProperties(filtered);
  }, [properties, searchFilters]);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSaveProperty = (propertyId: string) => {
    setSavedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/logo.svg" 
                  alt="MSA Real Estate" 
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Properties
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-gray-900">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-gray-900">
                Contact
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                  <Button onClick={signOut} variant="ghost" size="sm">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button onClick={handleSignIn} size="sm">
                  Sign In
                </Button>
              )}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 pt-2 pb-4 space-y-2">
              <Link href="/" className="block py-2 text-gray-700">
                Properties
              </Link>
              <Link href="/about" className="block py-2 text-gray-700">
                About
              </Link>
              <Link href="/contact" className="block py-2 text-gray-700">
                Contact
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Find Your Perfect Home
          </motion.h2>
          <motion.p 
            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Modern apartments in prime locations with seamless application process
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by location, property name..."
                className="pl-10 h-12 text-gray-900"
                value={searchFilters.searchTerm}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter size={20} />
              <span className="font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={searchFilters.bedrooms || ''}
                onChange={(e) => setSearchFilters(prev => ({ 
                  ...prev, 
                  bedrooms: e.target.value ? Number(e.target.value) : null 
                }))}
              >
                <option value="">Any Bedrooms</option>
                <option value="1">1 Bedroom</option>
                <option value="2">2 Bedrooms</option>
                <option value="3">3 Bedrooms</option>
                <option value="4">4+ Bedrooms</option>
              </select>

              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={searchFilters.bathrooms || ''}
                onChange={(e) => setSearchFilters(prev => ({ 
                  ...prev, 
                  bathrooms: e.target.value ? Number(e.target.value) : null 
                }))}
              >
                <option value="">Any Bathrooms</option>
                <option value="1">1 Bathroom</option>
                <option value="2">2 Bathrooms</option>
                <option value="3">3+ Bathrooms</option>
              </select>

              <select
                className="px-3 py-2 border rounded-md text-sm"
                value={searchFilters.priceRange[1]}
                onChange={(e) => setSearchFilters(prev => ({ 
                  ...prev, 
                  priceRange: [prev.priceRange[0], Number(e.target.value)] 
                }))}
              >
                <option value="5000">Any Price</option>
                <option value="1500">Under $1,500</option>
                <option value="2500">Under $2,500</option>
                <option value="3500">Under $3,500</option>
                <option value="5000">Under $5,000</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Property Listings */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Available Properties
            </h3>
            <p className="text-gray-600">
              {filteredProperties.length} properties available
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="card-hover overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={property.photos[0]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    <button
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
                      onClick={() => handleSaveProperty(property.id)}
                    >
                      <Heart 
                        size={20} 
                        className={savedProperties.includes(property.id) ? 'text-red-500 fill-current' : 'text-gray-400'}
                      />
                    </button>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <div className="flex items-center text-gray-500 text-sm">
                      <MapPin size={16} className="mr-1" />
                      {property.address}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(property.rent)}/mo
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Bed size={16} className="mr-1" />
                        {property.bedrooms} bed
                      </div>
                      <div className="flex items-center">
                        <Bath size={16} className="mr-1" />
                        {property.bathrooms} bath
                      </div>
                      <div className="flex items-center">
                        <Square size={16} className="mr-1" />
                        {property.squareFootage} sqft
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.amenities.slice(0, 3).map((amenity) => (
                        <span
                          key={amenity}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={`/property/${property.id}`} className="flex-1">
                        <Button className="w-full" size="sm">
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/apply/${property.id}`}>
                        <Button variant="outline" size="sm">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <img 
                src="/logo.svg" 
                alt="MSA Real Estate" 
                className="h-8 w-auto"
              />
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li><Link href="/" className="hover:text-gray-900">Properties</Link></li>
                    <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
                    <li><Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Email: 11jellis@gmail.com</li>
                    <li>Phone: +44 20 7123 4567</li>
                    <li>Address: London, UK</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MSA Real Estate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 