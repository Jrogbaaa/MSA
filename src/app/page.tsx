'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Heart, User, Menu, X, Package, Truck, Shield, Star, Clock, ArrowRight, Eye, ChevronDown, Mail, Phone } from 'lucide-react';
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
      // Show all properties including sold ones, but prioritize availability filter when set
      const matchesAvailability = searchFilters.availability === 'available' ? 
                                  (property.availability === 'available' || property.availability === 'sold') :
                                  property.availability === searchFilters.availability;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24 md:h-28">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="MSA Real Estate" 
                  width={600}
                  height={180}
                  className="h-20 md:h-40 w-auto"
                  priority
                />
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link href="/" className="px-4 py-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200 font-medium">
                Properties
              </Link>
              <a href="#storage-section" className="px-4 py-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200 font-medium">
                Storage
              </a>
              <Link href="/about" className="px-4 py-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200 font-medium">
                About
              </Link>
              <Link href="/contact" className="px-4 py-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200 font-medium">
                Contact
              </Link>
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  {/* User Profile Display */}
                  <div className="flex items-center space-x-3">
                    {user.photoURL ? (
                      <Image
                        src={user.photoURL}
                        alt={`${user.firstName} ${user.lastName}`}
                        width={36}
                        height={36}
                        className="rounded-full ring-2 ring-brand-200"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white text-sm font-semibold">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-700 hidden sm:block">
                      {user.firstName} {user.lastName}
                    </span>
                  </div>
                  
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="border-brand-200 text-brand-700 hover:bg-brand-50">
                      Dashboard
                    </Button>
                  </Link>
                  <Button onClick={signOut} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Link href="/auth/signin">
                  <Button size="sm" className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium px-6 shadow-lg shadow-brand-500/25">
                    Tenant Sign In
                  </Button>
                </Link>
              )}
              
              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
                    <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/50">
            <div className="px-4 py-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium">
                Properties
              </Link>
              <a href="#storage-section" className="block px-3 py-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium" onClick={() => setIsMenuOpen(false)}>
                Storage
              </a>
              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium">
                About
              </Link>
              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors font-medium">
                Contact
              </Link>
            </div>
          </div>
          </motion.div>
        )}
      </header>

      {/* Modern Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
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
        
        {/* Modern Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full backdrop-blur-sm animate-float" />
        <div className="absolute bottom-20 left-10 w-16 h-16 bg-brand-500/20 rounded-full backdrop-blur-sm animate-float" style={{ animationDelay: '2s' }} />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                Find Your Perfect
              </h1>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-display font-bold gradient-text-brand">
                Property
              </h1>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-base sm:text-xl md:text-2xl mb-8 text-gray-200 font-light leading-relaxed max-w-3xl mx-auto">
                Discover premium properties across England with our modern platform designed for the contemporary lifestyle
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="flex flex-col gap-4 justify-center max-w-md mx-auto">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white text-lg font-bold px-8 py-4 shadow-xl shadow-brand-500/25 btn-modern group w-full"
                  onClick={scrollToProperties}
                >
                Browse Properties
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="glass border-white/30 text-white hover:bg-white/10 hover:border-white/50 text-lg font-bold px-8 py-4 backdrop-blur-md btn-modern group w-full"
                  onClick={() => {
                    const storageSection = document.getElementById('storage-section');
                    if (storageSection) {
                      storageSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  Browse Storage
                  <Package className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                </Button>
              </div>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="mt-16 flex flex-wrap justify-center gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-white">{properties.length || '50'}+</div>
                <div className="text-sm text-gray-300 font-medium">Properties Available</div>
          </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-white">{storageSpaces.length || '20'}+</div>
                <div className="text-sm text-gray-300 font-medium">Storage Units</div>
        </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-300 font-medium">Support Available</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-white flex items-center">
                  4.9
                  <Star className="ml-1 h-6 w-6 text-yellow-400 fill-current" />
                </div>
                <div className="text-sm text-gray-300 font-medium">Customer Rating</div>
              </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="flex flex-col items-center text-white/70">
            <span className="text-sm font-medium mb-2">Scroll to explore</span>
            <ChevronDown className="h-6 w-6 animate-bounce" />
          </div>
          </div>
        </motion.div>
      </section>



      {/* Property Listings */}
      <section className="py-12" id="properties-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">
                Premium Properties
              </h2>
            {propertiesLoaded ? (
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Discover {filteredProperties.length} carefully selected properties designed for modern living
              </p>
            ) : (
                <p className="text-xl text-gray-600">Finding the perfect properties for you...</p>
            )}
              </div>
            </motion.div>
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
                  <Card className="card-modern overflow-hidden h-full flex flex-col group">
                    <div className="relative h-64 flex-shrink-0 overflow-hidden">
                      {/* Sold Overlay */}
                      {property.availability === 'sold' && (
                        <>
                          {/* Diagonal corner banner */}
                          <div className="absolute top-0 right-0 z-30">
                            <div className="bg-red-600 text-white px-8 py-2 transform rotate-45 translate-x-6 -translate-y-2 font-bold text-sm shadow-lg">
                              SOLD
                            </div>
                          </div>
                          {/* Central overlay */}
                          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center">
                            <div className="relative">
                              {/* Main SOLD banner */}
                              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-12 py-4 rounded-xl text-3xl font-bold shadow-2xl transform -rotate-12 border-4 border-white">
                                SOLD
                              </div>
                              {/* Additional emphasis */}
                              <div className="absolute -top-2 -right-2 bg-yellow-400 text-red-800 px-3 py-1 rounded-full text-sm font-bold transform rotate-12">
                                ✓
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      <Link href={`/property/${property.id}`} className="absolute inset-0 cursor-pointer group/image block">
                      <Image
                        src={property.photos[0]}
                        alt={property.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        priority={index < 4}
                      />
                        {/* Modern overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
                            <Eye className="w-6 h-6 text-gray-800" />
                          </div>
                        </div>
                        {/* Status badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {property.id === '1' && (
                            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg backdrop-blur-sm">
                              🔥 Only 2 left!
                        </div>
                      )}
                          {property.availability === 'sold' ? (
                            <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm">
                              SOLD
                            </div>
                          ) : (
                            <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                              Available Now
                            </div>
                          )}
                        </div>
                      </Link>
                      <button
                        className="absolute top-4 right-4 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg z-10 hover:bg-white transition-all duration-200 hover:scale-110"
                        onClick={() => handleSaveProperty(property.id)}
                      >
                        <Heart 
                          size={18} 
                          className={savedProperties.includes(property.id) ? 'text-red-500 fill-current' : 'text-gray-600'}
                        />
                      </button>
                      
                      {/* Quick stats overlay */}
                      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center text-gray-600">
                              <Bed size={14} className="mr-1" />
                              <span>{property.bedrooms}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Bath size={14} className="mr-1" />
                              <span>{property.bathrooms}</span>
                            </div>
                          </div>
                          <div className="font-semibold text-brand-600">
                            {formatCurrency(property.rent)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-semibold text-gray-900 leading-tight">
                        {property.title}
                      </CardTitle>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin size={16} className="mr-2 text-brand-500" />
                        {property.address}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">
                          {formatCurrency(property.rent)}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">per month</div>
                      </div>
                      
                      <div className="flex space-x-6 text-gray-600">
                        <div className="flex items-center">
                          <div className="p-2 bg-brand-50 rounded-lg mr-2">
                            <Bed size={16} className="text-brand-600" />
                        </div>
                          <span className="font-medium">{formatBedrooms(property.bedrooms)}</span>
                        </div>
                        <div className="flex items-center">
                          <div className="p-2 bg-brand-50 rounded-lg mr-2">
                            <Bath size={16} className="text-brand-600" />
                          </div>
                          <span className="font-medium">{formatBathrooms(property.bathrooms)}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
                        {property.amenities.slice(0, 3).map((amenity) => (
                          <span
                            key={amenity}
                            className="px-3 py-1 bg-gradient-to-r from-brand-50 to-brand-100 text-brand-700 text-xs font-medium rounded-full border border-brand-200"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-3 mt-auto pt-2">
                        <Link href={`/property/${property.id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-medium shadow-lg shadow-brand-500/25" size="sm">
                            View Details
                          </Button>
                        </Link>
                        {property.availability === 'sold' ? (
                          <Button disabled size="sm" className="border-gray-300 text-gray-400 bg-gray-100 font-medium cursor-not-allowed">
                            Sold
                          </Button>
                        ) : (
                          <Link href={`/apply/${property.id}`}>
                            <Button variant="outline" size="sm" className="border-brand-200 text-brand-700 hover:bg-brand-50 font-medium">
                              Apply Now
                            </Button>
                          </Link>
                        )}
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
      <section className="py-16 bg-gradient-to-br from-brand-50 to-blue-50" id="storage-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Secure Storage Solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Premium storage spaces designed with your security and convenience in mind. Climate-controlled units with 24/7 monitoring and easy access.
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
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200/30 rounded-full animate-float" />
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-200/30 rounded-full animate-float" style={{ animationDelay: '3s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-8">
                <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/25">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
                Cloud Storage Solutions
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Running out of phone storage because of too many photos? Get as much cloud storage as you need with our competitive pricing. Store thousands of photos safely in the cloud and access them anywhere.
              </p>
              
              <div className="card-modern p-10 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg shadow-green-500/25">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Unlimited Photos</h3>
                    <p className="text-gray-600">Store as many photos as you need without worrying about space limits</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Secure & Safe</h3>
                    <p className="text-gray-600">Military-grade encryption keeps your precious memories protected</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/25">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">Lightning Fast</h3>
                    <p className="text-gray-600">Access your photos from any device in seconds</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link href="/contact">
                    <Button size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-lg px-10 py-4 font-semibold shadow-xl shadow-blue-500/25 btn-modern group">
                      Get Cloud/Photos Storage
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  
                  <p className="text-gray-500 mt-6 flex items-center justify-center flex-wrap gap-4">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Competitive pricing
                    </span>
                    <span className="flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Custom storage plans
                    </span>
                    <span className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      Free consultation
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-500/10 rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full translate-x-24 translate-y-24" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="mb-6">
              <Image 
                src="/logo.png" 
                alt="MSA Real Estate" 
                width={500}
                height={150}
                className="h-24 w-auto"
              />
            </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Your trusted partner in finding premium properties and secure storage solutions across England.
              </p>
              <div className="flex space-x-4">
                <div className="p-3 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="p-3 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </div>
                <div className="p-3 bg-white/10 hover:bg-white/20 rounded-lg cursor-pointer transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
              </div>
            </div>
            
                <div>
              <h4 className="text-xl font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center group"><ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />Properties</Link></li>
                <li><Link href="/about" className="text-gray-300 hover:text-white transition-colors flex items-center group"><ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />About Us</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white transition-colors flex items-center group"><ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />Contact</Link></li>
                <li><Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center group"><ArrowRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />Dashboard</Link></li>
                  </ul>
                </div>
            
                <div>
              <h4 className="text-xl font-semibold text-white mb-6">Get In Touch</h4>
              <ul className="space-y-4">
                <li className="flex items-center">
                  <div className="p-2 bg-brand-500/20 rounded-lg mr-3">
                    <Mail className="w-4 h-4 text-brand-400" />
                </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white">arnoldestates1@gmail.com</p>
              </div>
                </li>
                <li className="flex items-center">
                  <div className="p-2 bg-brand-500/20 rounded-lg mr-3">
                    <Phone className="w-4 h-4 text-brand-400" />
            </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white">+44 7756 779811</p>
          </div>
                </li>
                <li className="flex items-center">
                  <div className="p-2 bg-brand-500/20 rounded-lg mr-3">
                    <MapPin className="w-4 h-4 text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="text-white">Northampton, UK</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-lg">
              &copy; 2025 MSA Real Estate. All rights reserved. | Designed with ❤️ for modern living.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}