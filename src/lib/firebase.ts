import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
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

// Enhanced connection management with Firestore internal error handling
let isConnectionHealthy = true;
let lastConnectionCheck = new Date();
let firestoreResetCount = 0;

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
  } catch (error: any) {
    console.error('🔥 Firestore connection issue:', error);
    
    // Handle specific Firebase errors
    if (error?.message?.includes('INTERNAL ASSERTION FAILED')) {
      console.warn('🔄 Firestore internal error detected, attempting recovery...');
      await attemptFirestoreRecovery();
    } else if (error?.message?.includes('Target ID already exists')) {
      console.warn('🔄 Firebase Target ID conflict detected, clearing connection...');
      await clearFirebaseConnections();
    } else if (error?.message?.includes('Missing or insufficient permissions')) {
      console.warn('🔒 Firebase permissions error detected, checking auth state...');
      await refreshFirebaseAuth();
    }
    
    isConnectionHealthy = false;
    lastConnectionCheck = now;
    return false;
  }
};

// Clear Firebase connections to resolve Target ID conflicts
const clearFirebaseConnections = async (): Promise<void> => {
  try {
    console.log('🔄 Clearing Firebase connections...');
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait longer for cleanup
    await enableNetwork(db);
    console.log('✅ Firebase connections cleared successfully');
  } catch (error) {
    console.error('❌ Failed to clear Firebase connections:', error);
  }
};

// Refresh Firebase authentication state
const refreshFirebaseAuth = async (): Promise<void> => {
  try {
    console.log('🔄 Refreshing Firebase auth state...');
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Force token refresh
      await currentUser.getIdToken(true);
      console.log('✅ Firebase auth token refreshed');
    } else {
      console.log('ℹ️ No authenticated user to refresh');
    }
  } catch (error) {
    console.error('❌ Failed to refresh Firebase auth:', error);
  }
};

// Enhanced recovery mechanism
export const attemptFirestoreRecovery = async (): Promise<void> => {
  if (firestoreResetCount >= 3) {
    console.warn('🚨 Maximum Firestore reset attempts reached, falling back to localStorage');
    return;
  }
  
  try {
    firestoreResetCount++;
    console.log(`🔄 Attempting Firestore recovery (attempt ${firestoreResetCount}/3)...`);
    
    // Disable network
    await disableNetwork(db);
    console.log('📴 Firestore network disabled');
    
    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Re-enable network
    await enableNetwork(db);
    console.log('📶 Firestore network re-enabled');
    
    // Reset counter on successful recovery
    setTimeout(() => {
      firestoreResetCount = 0;
      console.log('🔄 Recovery counter reset');
    }, 10000); // Reset after 10 seconds
    
    console.log('✅ Firestore recovery completed');
  } catch (error) {
    console.error('❌ Firestore recovery failed:', error);
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

// Firebase Permissions Test
export const testFirebasePermissions = async (): Promise<{
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  messagesPermission: boolean;
  errors: string[];
  details: string[];
}> => {
  const results = {
    canRead: false,
    canWrite: false,
    canDelete: false,
    messagesPermission: false,
    errors: [] as string[],
    details: [] as string[]
  };

  const testDocId = `test_${Date.now()}`;
  const testDocRef = doc(db, 'properties', testDocId);
  const testMessageRef = doc(db, 'messages', `test_message_${Date.now()}`);
  
  try {
    console.log('🔍 Testing Firebase permissions...');
    
    // Test Write Permission
    try {
      await setDoc(testDocRef, {
        title: 'Test Property',
        createdAt: new Date(),
        testDocument: true
      });
      results.canWrite = true;
      results.details.push('✅ Write permission: SUCCESS');
      console.log('✅ Firebase write permission: SUCCESS');
    } catch (writeError: any) {
      results.canWrite = false;
      results.errors.push(`Write failed: ${writeError.message}`);
      results.details.push(`❌ Write permission: FAILED (${writeError.code || 'unknown'})`);
      console.error('❌ Firebase write permission: FAILED', writeError);
    }
    
    // Test Read Permission
    try {
      const docSnapshot = await getDoc(testDocRef);
      results.canRead = true;
      results.details.push('✅ Read permission: SUCCESS');
      console.log('✅ Firebase read permission: SUCCESS');
    } catch (readError: any) {
      results.canRead = false;
      results.errors.push(`Read failed: ${readError.message}`);
      results.details.push(`❌ Read permission: FAILED (${readError.code || 'unknown'})`);
      console.error('❌ Firebase read permission: FAILED', readError);
    }
    
    // Test Delete Permission (only if write succeeded)
    if (results.canWrite) {
      try {
        await deleteDoc(testDocRef);
        results.canDelete = true;
        results.details.push('✅ Delete permission: SUCCESS');
        console.log('✅ Firebase delete permission: SUCCESS');
      } catch (deleteError: any) {
        results.canDelete = false;
        results.errors.push(`Delete failed: ${deleteError.message}`);
        results.details.push(`❌ Delete permission: FAILED (${deleteError.code || 'unknown'})`);
        console.error('❌ Firebase delete permission: FAILED', deleteError);
      }
    }
    
    // Test Messages Collection Permission - CRITICAL for admin dashboard
    try {
      await setDoc(testMessageRef, {
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message for permissions',
        createdAt: new Date(),
        isRead: false
      });
      
      // Try to read the message
      const messageSnapshot = await getDoc(testMessageRef);
      
      // Try to delete the test message
      await deleteDoc(testMessageRef);
      
      results.messagesPermission = true;
      results.details.push('✅ Messages collection: SUCCESS');
      console.log('✅ Firebase messages permission: SUCCESS');
    } catch (messageError: any) {
      results.messagesPermission = false;
      results.errors.push(`Messages collection failed: ${messageError.message}`);
      results.details.push(`❌ Messages collection: FAILED (${messageError.code || 'unknown'})`);
      console.error('❌ Firebase messages permission: FAILED', messageError);
      
      if (messageError.code === 'permission-denied') {
        results.details.push('🔧 FIX: Add messages collection rules to Firestore');
        results.details.push('📋 See FIREBASE_RULES.md for complete rules');
      }
    }
    
  } catch (generalError: any) {
    results.errors.push(`General error: ${generalError.message}`);
    results.details.push(`❌ General Firebase error: ${generalError.code || 'unknown'}`);
    console.error('❌ General Firebase error:', generalError);
  }
  
  return results;
};

// Initialize Analytics (disabled due to API key issues)
let analytics: any = null;
// Commenting out analytics until Firebase API key is updated
// if (typeof window !== 'undefined') {
//   analytics = getAnalytics(app);
// }

export { analytics };
export default app; 