export interface Property {
  id: string;
  title: string;
  address: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  description: string;
  amenities: string[];
  photos: string[];
  availability: 'available' | 'occupied' | 'maintenance' | 'sold';
  epcRating?: string;
  councilTaxBand?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StorageSpace {
  id: string;
  title: string;
  size: string; // e.g., "5x5 ft", "10x10 ft"
  squareFootage: number;
  monthlyRate: number;
  description: string;
  features: string[];
  photos: string[];
  availability: 'available' | 'occupied' | 'maintenance';
  unitCount: number; // Number of identical units available
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  photoURL?: string;
  role: 'tenant' | 'admin';
  savedProperties: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  userId: string;
  propertyId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    ssn: string;
  };
  employmentInfo: {
    employer: string;
    position: string;
    monthlyIncome: number;
    employmentLength: string;
  };
  references: Reference[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Reference {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

export interface Document {
  id: string;
  type: 'pay_stub' | 'bank_statement' | 'identification' | 'other';
  fileName: string;
  fileURL: string;
  uploadedAt: Date;
}

export interface FilterOptions {
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  availability?: 'available' | 'occupied' | 'maintenance';
}

export interface SearchFilters {
  priceRange: [number, number];
  bedrooms: number | null;
  bathrooms: number | null;
  availability: string;
  searchTerm: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
} 