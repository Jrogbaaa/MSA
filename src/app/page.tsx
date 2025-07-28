'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, User, Menu, X, Package, Truck, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Property, SearchFilters, StorageSpace } from '@/types';
import { properties as initialProperties } from '@/data/properties';
import { storageSpaces as initialStorageSpaces } from '@/data/storageSpaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatBedrooms, formatBathrooms } from '@/lib/utils';
import { getAllProperties, subscribeToProperties } from '@/lib/properties';
import { getAllStorageSpaces, subscribeToStorageSpaces } from '@/lib/storageSpaces';
import Link from 'next/link';
import Image from 'next/image';

// Hero background images - luxury apartment interiors with furniture and views
const heroBackgrounds = [
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2558&q=80', // Luxury living room with city view
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80', // Modern luxury apartment interior
  'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80', // Modern luxury kitchen with island
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80', // Luxury living room with modern furniture
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80', // Modern bedroom with city view
];

export default function HomePage() {
  const { user, signOut } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [storageSpaces, setStorageSpaces] = useState<StorageSpace[]>([]);
  const [filteredStorageSpaces, setFilteredStorageSpaces] = useState<StorageSpace[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    priceRange: [0, 4000],
    bedrooms: null,
    bathrooms: null,
    availability: 'available',
    searchTerm: '',
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [savedProperties, setSavedProperties] = useState<string[]>([]);
  const [savedStorageSpaces, setSavedStorageSpaces] = useState<string[]>([]);
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [propertiesLoaded, setPropertiesLoaded] = useState(false);
  const [storageSpacesLoaded, setStorageSpacesLoaded] = useState(false);

  // Load properties from Firebase with localStorage fallback
  useEffect(() => {
    setPropertiesLoaded(false);
    console.log('🔄 Setting up real-time properties subscription for homepage...');

    const unsubscribe = subscribeToProperties((updatedProperties) => {
      console.log(`🏠 HomePage real-time update: ${updatedProperties.length} properties`);
      setProperties(updatedProperties);
      
      if (!propertiesLoaded) {
        setPropertiesLoaded(true);
      }
    });

    return () => {
      console.log('🧹 Cleaning up homepage properties subscription...');
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Load storage spaces from Firebase with localStorage fallback
  useEffect(() => {
    setStorageSpacesLoaded(false);
    console.log('🔄 Setting up real-time storage spaces subscription for homepage...');

    const unsubscribe = subscribeToStorageSpaces((updatedStorageSpaces) => {
      console.log(`📦 HomePage storage spaces real-time update: ${updatedStorageSpaces.length} storage spaces`);
      setStorageSpaces(updatedStorageSpaces);
      
      if (!storageSpacesLoaded) {
        setStorageSpacesLoaded(true);
      }
    });

    return () => {
      console.log('🧹 Cleaning up homepage storage spaces subscription...');
      unsubscribe();
    };
  }, []);

  // Preload hero images
  useEffect(() => {
    if (heroBackgrounds.length > 0) {
      const preloadImages = () => {
        let loadedCount = 0;
        const totalImages = heroBackgrounds.length;
        const loadedImages = new Set();

        heroBackgrounds.forEach((src, index) => {
          const img = document.createElement('img');
          img.onload = () => {
            loadedImages.add(index);
            loadedCount++;
            if (loadedCount === totalImages) {
              setImagesLoaded(true);
              console.log(`Hero images preloaded: ${loadedImages.size}/${totalImages} successful`);
            }
          };
          img.onerror = (error) => {
            console.warn(`Failed to load hero image ${index + 1}:`, src);
            loadedCount++;
            if (loadedCount === totalImages) {
              setImagesLoaded(true);
              console.log(`Hero image preloading completed: ${loadedImages.size}/${totalImages} successful`);
            }
          };
          img.src = src;
        });
      };

      preloadImages();
    }
  }, []);

  // Hero slideshow effect - only start after images are loaded
  useEffect(() => {
    if (!imagesLoaded) return;
    
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroBackgrounds.length);
    }, 6000); // Slower transition for smoother experience

    return () => clearInterval(interval);
  }, [imagesLoaded]);

  // Filter properties based on search criteria
  useEffect(() => {
    if (!propertiesLoaded) return;

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
  }, [searchFilters, properties, propertiesLoaded]);

  // Filter storage spaces based on availability and search
  useEffect(() => {
    if (!storageSpacesLoaded) return;

    let filtered = storageSpaces.filter(space => {
      const matchesAvailability = space.availability === 'available';
      const matchesSearch = searchFilters.searchTerm === '' || 
                          space.title.toLowerCase().includes(searchFilters.searchTerm.toLowerCase()) ||
                          space.size.toLowerCase().includes(searchFilters.searchTerm.toLowerCase());

      return matchesAvailability && matchesSearch;
    });

    setFilteredStorageSpaces(filtered);
  }, [searchFilters.searchTerm, storageSpaces, storageSpacesLoaded]);

  const handleSaveProperty = (propertyId: string) => {
    setSavedProperties(prev => 
      prev.includes(propertyId) 
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSaveStorageSpace = (storageSpaceId: string) => {
    setSavedStorageSpaces(prev => 
      prev.includes(storageSpaceId) 
        ? prev.filter(id => id !== storageSpaceId)
        : [...prev, storageSpaceId]
    );
  };

  const scrollToProperties = () => {
    const propertiesSection = document.getElementById('properties-section');
    if (propertiesSection) {
      propertiesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-28">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="MSA Real Estate" 
                  width={600}
                  height={180}
                  className="h-40 w-auto"
                  priority
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-gray-900">
                Properties
              </Link>
              <a href="#storage-section" className="text-gray-700 hover:text-gray-900">
                Storage
              </a>
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
                  {/* User Profile Display */}
                  <div className="flex items-center space-x-3">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  
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
                <Link href="/auth/signin">
                  <Button size="sm">
                    Tenant Sign In
                  </Button>
                </Link>
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
              <a href="#storage-section" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                Storage
              </a>
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
      <section className="relative h-96 md:h-[500px] overflow-hidden bg-gray-600">
        {/* Background images */}
        {heroBackgrounds.map((bg, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              index === currentHeroImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={bg}
              alt={`Hero background ${index + 1}`}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
              onError={() => {
                console.warn(`Hero image ${index + 1} failed to load:`, bg);
              }}
            />
          </div>
        ))}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Find Your Perfect Property
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-lg md:text-xl mb-8 text-gray-200">
                Discover premium properties across England with our modern platform
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3" onClick={scrollToProperties}>
                  Browse Properties
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
                  onClick={() => {
                    const storageSection = document.getElementById('storage-section');
                    if (storageSection) {
                      storageSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Browse Storage
                </Button>
              </div>
            </motion.div>
          </div>
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
                <option value="0">Studio</option>
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
                <option value="1500">Under £1,500</option>
                <option value="2500">Under £2,500</option>
                <option value="3500">Under £3,500</option>
                <option value="5000">Under £5,000</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Property Listings */}
      <section className="py-12" id="properties-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Available Properties
            </h3>
            {propertiesLoaded ? (
              <p className="text-gray-600">
                {filteredProperties.length} properties available
              </p>
            ) : (
              <p className="text-gray-600">Loading properties...</p>
            )}
          </div>

          {!propertiesLoaded ? (
            // Loading State
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Card key={index} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardHeader className="pb-3">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
                    <div className="flex space-x-4 mb-4">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded flex-1"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            // No Properties Found State
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MapPin size={48} className="mx-auto mb-4" />
              </div>
              <h4 className="text-xl font-semibold text-gray-700 mb-2">
                No properties found
              </h4>
              <p className="text-gray-600 mb-6">
                Try adjusting your search filters to see more results.
              </p>
              <Button 
                onClick={() => setSearchFilters({
                  priceRange: [0, 4000],
                  bedrooms: null,
                  bathrooms: null,
                  availability: 'available',
                  searchTerm: '',
                })}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            // Properties Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="card-hover overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 flex-shrink-0 bg-gray-100">
                      <Link href={`/property/${property.id}`} className="absolute inset-0 cursor-pointer group block">
                        <Image
                          src={property.photos[0]}
                          alt={property.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                          priority={index < 4}
                        />
                        {/* View property overlay */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                            <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                        </div>
                        {/* Urgency Badge */}
                        {property.id === '1' && (
                          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                            Only 2 left!
                          </div>
                        )}
                      </Link>
                      <button
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md z-10"
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
                    
                    <CardContent className="flex-1 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(property.rent)}/mo
                        </div>
                      </div>
                      
                      <div className="flex space-x-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Bed size={16} className="mr-1" />
                          {formatBedrooms(property.bedrooms)}
                        </div>
                        <div className="flex items-center">
                          <Bath size={16} className="mr-1" />
                          {formatBathrooms(property.bathrooms)}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
                        {property.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2 mt-auto">
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
          )}
        </div>
      </section>

      {/* Storage Spaces Section */}
      <section className="py-12 bg-gray-50" id="storage-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Secure Storage Spaces
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Safe, clean, and affordable storage solutions for all your needs. Climate-controlled units with 24/7 security.
              </p>
            </motion.div>
          </div>

          {!storageSpacesLoaded ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading storage spaces...</p>
            </div>
          ) : filteredStorageSpaces.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No storage spaces available</h3>
              <p className="text-gray-600">Please check back later for available units.</p>
            </div>
          ) : (
            // Storage Spaces Grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredStorageSpaces.map((space, index) => (
                <motion.div
                  key={space.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="card-hover overflow-hidden h-full flex flex-col">
                    <div className="relative h-48 flex-shrink-0 bg-gray-100">
                      <Image
                        src={space.photos[0]}
                        alt={space.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        className="object-contain"
                        priority={index < 4}
                      />
                      {/* Units Available Badge */}
                      <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {space.unitCount} units available
                      </div>
                      <button
                        className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md"
                        onClick={() => handleSaveStorageSpace(space.id)}
                      >
                        <Heart 
                          size={20} 
                          className={savedStorageSpaces.includes(space.id) ? 'text-red-500 fill-current' : 'text-gray-400'}
                        />
                      </button>
                    </div>
                    
                    <CardContent className="p-4 flex-grow flex flex-col">
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{space.title}</h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{space.description}</p>
                        
                        {/* Size and Price */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center text-gray-500 text-sm">
                            <Square size={16} className="mr-1" />
                            <span>{space.size} ({space.squareFootage} sq ft)</span>
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            {formatCurrency(space.monthlyRate)}/week
                          </div>
                        </div>
                        
                        {/* Key Features */}
                        <div className="space-y-1">
                          {space.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-500">
                              {feature === '24/7 Security' && <Shield size={12} className="mr-1" />}
                              {feature === 'Drive-up Access' && <Truck size={12} className="mr-1" />}
                              {feature === 'Climate Controlled' && <Package size={12} className="mr-1" />}
                              {!['24/7 Security', 'Drive-up Access', 'Climate Controlled'].includes(feature) && <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>}
                              <span>{feature}</span>
                            </div>
                          ))}
                          {space.features.length > 3 && (
                            <div className="text-xs text-gray-400">
                              +{space.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-4">
                        <Link href={`/storage/${space.id}`} className="flex-1">
                          <Button className="w-full" size="sm">
                            View Details
                          </Button>
                        </Link>
                        <Link href={`/storage/${space.id}?reserve=true`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Package size={14} className="mr-1" />
                            Reserve
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Cloud Storage Section */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-blue-100 rounded-full">
                  <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Cloud Storage Solutions
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Running out of phone storage because of too many photos? Get as much cloud storage as you need with our competitive pricing. Store thousands of photos safely in the cloud and access them anywhere.
              </p>
              
              <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Unlimited Photos</h3>
                    <p className="text-sm text-gray-600">Store as many photos as you need</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Secure & Safe</h3>
                    <p className="text-sm text-gray-600">Your photos are encrypted and protected</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900">Fast Access</h3>
                    <p className="text-sm text-gray-600">Access your photos from any device</p>
                  </div>
                </div>
                
                <Link href="/contact">
                  <Button size="lg" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-3">
                    Get Cloud/Photos Storage
                  </Button>
                </Link>
                
                <p className="text-sm text-gray-500 mt-4">
                  Competitive pricing • Custom storage plans • Free consultation
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:justify-start">
              <Image 
                src="/logo.png" 
                alt="MSA Real Estate" 
                width={500}
                height={150}
                className="h-24 w-auto"
              />
            </div>
            <div className="mt-4 md:mt-0 md:ml-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li><Link href="/" className="hover:text-gray-900">Properties</Link></li>
                    <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
                    <li><Link href="/contact" className="hover:text-gray-900">Contact</Link></li>
                    <li><Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>Email: arnoldestates1@gmail.com</li>
                    <li>Phone: 12345678</li>
                    <li>Address: Northampton, UK</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 MSA Real Estate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}