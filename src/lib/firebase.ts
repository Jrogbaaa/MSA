import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { logFirebaseConfigDiagnostic, checkFirebaseHealth } from './firebaseConfig';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Log diagnostic information during initialization
if (typeof window !== 'undefined') {
  logFirebaseConfigDiagnostic();
}

// Initialize Firebase with error handling
let app: any;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize Firebase services with improved configuration
export const auth = getAuth(app);

// Initialize Firestore with proper cache configuration
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Set authentication persistence to LOCAL (persists across browser sessions)
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Error setting auth persistence:', error);
  });
}

// Enhanced connection management
let isConnectionHealthy = true;
let lastConnectionCheck = new Date();

export const checkFirestoreConnection = async (): Promise<boolean> => {
  const now = new Date();
  
  try {
    // Don't check too frequently
    if (now.getTime() - lastConnectionCheck.getTime() < 5000) {
      return isConnectionHealthy;
    }
    
    await enableNetwork(db);
    isConnectionHealthy = true;
    lastConnectionCheck = now;
    
    console.log('✅ Firestore connection healthy');
    return true;
  } catch (error) {
    console.error('🔥 Firestore connection issue:', error);
    isConnectionHealthy = false;
    lastConnectionCheck = now;
    return false;
  }
};

export const getConnectionStatus = (): boolean => {
  return isConnectionHealthy;
};

// Enhanced Firebase health monitoring
export const getFirebaseStatus = async () => {
  const health = await checkFirebaseHealth();
  const connectionStatus = await checkFirestoreConnection();
  
  return {
    ...health,
    firestoreConnected: connectionStatus,
    authInitialized: !!auth,
    storageInitialized: !!storage
  };
};

// Connection retry with exponential backoff
export const retryFirestoreConnection = async (maxRetries = 3): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const success = await checkFirestoreConnection();
      if (success) {
        console.log(`✅ Firestore connection restored on attempt ${attempt}`);
        return true;
      }
    } catch (error) {
      console.warn(`❌ Connection attempt ${attempt} failed:`, error);
    }
    
    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      console.log(`⏳ Retrying connection in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('❌ All connection attempts failed');
  return false;
};

// Initialize Analytics (disabled due to API key issues)
let analytics: any = null;
// Commenting out analytics until Firebase API key is updated
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

export { analytics };
export default app; 