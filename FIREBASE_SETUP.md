# Firebase Integration Setup Guide

## Overview
The MSA Properties platform uses Firebase as its primary backend service, providing real-time data synchronization, authentication, and cloud storage capabilities.

## 🔥 Firebase Services Used

### 1. Firebase Firestore (Database)
- **Purpose**: Real-time property data storage
- **Collections**: `properties`, `users`, `tenantDocuments`
- **Features**: Real-time updates, offline persistence, security rules

### 2. Firebase Authentication
- **Purpose**: User authentication and session management
- **Providers**: Google OAuth, Email/Password
- **Features**: Persistent sessions, secure token management

### 3. Firebase Storage
- **Purpose**: File and image storage
- **Features**: Secure file uploads, image optimization

## 🛠️ Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `msa-properties` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Required Services

#### Enable Firestore Database
1. Navigate to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Start in "Test mode" (we'll add security rules later)
4. Choose your preferred location (e.g., `europe-west2`)
5. Click "Done"

#### Enable Authentication
1. Navigate to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Google" provider
5. Add authorized domains: `localhost`, `msaproperties.co.uk`
6. Save configuration

#### Enable Storage
1. Navigate to "Storage" in the left sidebar
2. Click "Get started"
3. Start in "Test mode"
4. Choose same location as Firestore
5. Click "Done"

### 3. Get Firebase Configuration
1. Navigate to "Project settings" (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" → Web app
4. Enter app name: `MSA Properties`
5. Copy the configuration object

### 4. Environment Variables
Add these to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🗄️ Database Structure

### Properties Collection
```javascript
// Collection: properties
{
  id: "property_1234567890",
  title: "Beautiful 2-Bedroom Apartment",
  address: "123 Main Street, Northampton",
  rent: 2500,
  bedrooms: 2,
  bathrooms: 1,
  squareFootage: 850,
  availability: "available", // "available" | "occupied" | "maintenance"
  photos: ["data:image/jpeg;base64,...", ...], // Array of base64 images
  amenities: ["WiFi", "Parking", "Garden"],
  description: "Modern apartment in prime location...",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Users Collection
```javascript
// Collection: users
{
  id: "user_uid_from_auth",
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  phoneNumber: "+44 20 1234 5678",
  role: "tenant", // "tenant" | "admin"
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Tenant Documents Collection
```javascript
// Collection: tenantDocuments
{
  id: "doc_1234567890",
  fileName: "lease_agreement.pdf",
  fileType: "application/pdf",
  fileSize: 2048000,
  tenantId: "user_uid",
  tenantEmail: "tenant@example.com",
  tenantName: "John Doe",
  documentType: "lease", // "lease" | "application" | "insurance" | "identification" | "reference" | "other"
  status: "pending", // "pending" | "signed" | "expired"
  base64Data: "data:application/pdf;base64,...",
  uploadDate: Timestamp,
  description: "Lease agreement for 2024"
}
```

## 🔒 Security Rules

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties collection - readable by all, writable by authenticated admins
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   (request.auth.token.admin == true || 
                    request.auth.token.email == "arnoldestates1@gmail.com");
    }
    
    // Users collection - readable/writable by owner or admin
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                          (request.auth.uid == userId || 
                           request.auth.token.admin == true);
    }
    
    // Tenant documents - readable/writable by tenant owner or admin
    match /tenantDocuments/{documentId} {
      allow read, write: if request.auth != null && 
                          (resource.data.tenantId == request.auth.uid || 
                           request.auth.token.admin == true);
    }
    
    // Applications collection (if created)
    match /applications/{applicationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Property images - readable by all, writable by authenticated admins
    match /properties/{propertyId}/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && 
                   (request.auth.token.admin == true || 
                    request.auth.token.email == "arnoldestates1@gmail.com");
    }
    
    // User uploads - readable/writable by owner or admin
    match /users/{userId}/{filename} {
      allow read, write: if request.auth != null && 
                          (request.auth.uid == userId || 
                           request.auth.token.admin == true);
    }
  }
}
```

## 📊 Real-time Features

### Property Updates
```javascript
import { subscribeToProperties } from '@/lib/properties';

// Subscribe to real-time property updates
const unsubscribe = subscribeToProperties((properties) => {
  console.log('Properties updated:', properties);
  setProperties(properties);
});

// Cleanup subscription
return () => unsubscribe();
```

### User Authentication State
```javascript
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});
```

## 🚀 Deployment Configuration

### Vercel Environment Variables
Set these in your Vercel dashboard:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Firebase Hosting (Optional)
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting
firebase init hosting

# Deploy to Firebase
firebase deploy
```

## 🔧 Development Tips

### Local Development
```bash
# Install Firebase emulators
firebase init emulators

# Start emulators
firebase emulators:start

# Update firebase.js for local development
const useEmulator = process.env.NODE_ENV === 'development';
if (useEmulator) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectAuthEmulator(auth, 'http://localhost:9099');
}
```

### Data Migration
```javascript
// Initialize default properties (run once)
import { initializeDefaultProperties } from '@/lib/properties';

// Run this in your admin panel or setup script
await initializeDefaultProperties();
```

### Backup Strategy
```javascript
// Export all data
const exportData = async () => {
  const properties = await getAllProperties();
  const users = await getAllUsers();
  const documents = await getAllDocuments();
  
  return {
    properties,
    users,
    documents,
    exportDate: new Date().toISOString()
  };
};
```

## 📝 Testing Firebase Integration

### Test Properties CRUD
```javascript
import { saveProperty, getAllProperties, deleteProperty } from '@/lib/properties';

// Test saving a property
const testProperty = {
  id: 'test_property_123',
  title: 'Test Property',
  address: '123 Test St',
  rent: 1000,
  bedrooms: 2,
  bathrooms: 1,
  squareFootage: 800,
  availability: 'available',
  photos: [],
  amenities: ['WiFi'],
  description: 'Test property',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Save property
await saveProperty(testProperty);

// Get all properties
const properties = await getAllProperties();

// Delete property
await deleteProperty('test_property_123');
```

## 🚨 Error Handling

### Common Issues
1. **Permission Denied**: Check Firestore security rules
2. **Network Errors**: Implement fallback to localStorage
3. **Quota Exceeded**: Monitor Firebase usage and billing
4. **Auth Errors**: Verify environment variables

### Error Recovery
```javascript
// Automatic fallback to localStorage
try {
  const properties = await getAllProperties();
  setProperties(properties);
} catch (error) {
  console.error('Firebase error:', error);
  // Fallback to localStorage
  const savedProperties = localStorage.getItem('msa_admin_properties');
  if (savedProperties) {
    setProperties(JSON.parse(savedProperties));
  }
}
```

## 📈 Monitoring & Analytics

### Firebase Console
- Monitor database usage
- Track authentication events
- View storage usage
- Monitor performance

### Custom Analytics
```javascript
// Track property views
import { logEvent } from 'firebase/analytics';

logEvent(analytics, 'property_view', {
  property_id: propertyId,
  property_title: propertyTitle
});
```

## 🔄 Migration from localStorage

### Automatic Migration
The system automatically migrates existing localStorage data to Firebase:

```javascript
// Migration happens automatically in PropertyManager
useEffect(() => {
  const migrateData = async () => {
    // Check if properties exist in localStorage but not in Firebase
    const localProperties = localStorage.getItem('msa_admin_properties');
    if (localProperties) {
      const properties = JSON.parse(localProperties);
      // Save each property to Firebase
      for (const property of properties) {
        await saveProperty(property);
      }
    }
  };
  
  migrateData();
}, []);
```

## 📞 Support

If you encounter issues with Firebase setup:
1. Check Firebase Console for error messages
2. Verify environment variables are correct
3. Ensure security rules are properly configured
4. Contact: arnoldestates1@gmail.com

---

**Firebase Integration Status**: ✅ **OPERATIONAL**  
**Last Updated**: January 2025  
**Version**: v2.0.0 