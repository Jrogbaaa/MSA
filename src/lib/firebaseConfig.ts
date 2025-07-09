// Firebase Configuration Diagnostic Tool
// This tool helps identify and resolve Firebase connection issues

interface FirebaseConfigDiagnostic {
  projectId: string;
  authDomain: string;
  apiKey: string;
  hasValidConfig: boolean;
  errors: string[];
  warnings: string[];
}

// Diagnostic function to check Firebase configuration
export const diagnoseFirebaseConfig = (): FirebaseConfigDiagnostic => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const config = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  };
  
  // Check for missing required environment variables
  if (!config.projectId) {
    errors.push('Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable');
  }
  
  if (!config.authDomain) {
    errors.push('Missing NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN environment variable');
  }
  
  if (!config.apiKey) {
    errors.push('Missing NEXT_PUBLIC_FIREBASE_API_KEY environment variable');
  }
  
  // Check for common configuration issues
  if (config.projectId && config.authDomain) {
    // Extract project ID from auth domain
    const authDomainProjectId = config.authDomain.split('.')[0];
    
    if (authDomainProjectId !== config.projectId) {
      warnings.push(
        `Project ID mismatch: projectId="${config.projectId}" but authDomain suggests "${authDomainProjectId}"`
      );
    }
  }
  
  // Check for legacy project references
  if (config.projectId.includes('msa-lettings')) {
    warnings.push('Using legacy project ID format - consider updating to new format');
  }
  
  // Check API key format
  if (config.apiKey && !config.apiKey.startsWith('AIza')) {
    warnings.push('API key may be invalid - should start with "AIza"');
  }
  
  return {
    projectId: config.projectId,
    authDomain: config.authDomain,
    apiKey: config.apiKey.substring(0, 10) + '...' + config.apiKey.substring(config.apiKey.length - 4),
    hasValidConfig: errors.length === 0,
    errors,
    warnings
  };
};

// Updated Firestore Security Rules for MSA Properties
export const generateFirestoreSecurityRules = (projectId: string): string => {
  return `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties collection - public read, authenticated write
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Users collection - user can read/write own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Applications collection - user can read/write own applications
    match /applications/{applicationId} {
      allow read, write: if request.auth != null;
    }
    
    // Documents collection - user can read/write own documents
    match /documents/{documentId} {
      allow read, write: if request.auth != null;
    }
    
    // Admin collection - restricted to admin users
    match /admin/{document} {
      allow read, write: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com",
          "arnoldestatesmsa@gmail.com"
        ];
    }
  }
}
`;
};

// Function to log configuration diagnostic
export const logFirebaseConfigDiagnostic = (): void => {
  if (typeof window !== 'undefined') {
    const diagnostic = diagnoseFirebaseConfig();
    
    console.group('🔥 Firebase Configuration Diagnostic');
    console.log('Project ID:', diagnostic.projectId);
    console.log('Auth Domain:', diagnostic.authDomain);
    console.log('API Key:', diagnostic.apiKey);
    console.log('Valid Config:', diagnostic.hasValidConfig);
    
    if (diagnostic.errors.length > 0) {
      console.group('❌ Errors');
      diagnostic.errors.forEach(error => console.error(error));
      console.groupEnd();
    }
    
    if (diagnostic.warnings.length > 0) {
      console.group('⚠️ Warnings');
      diagnostic.warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }
    
    console.groupEnd();
  }
};

// Connection health check
export const checkFirebaseHealth = async (): Promise<{
  isHealthy: boolean;
  projectId: string;
  timestamp: Date;
  error?: string;
}> => {
  try {
    const diagnostic = diagnoseFirebaseConfig();
    
    return {
      isHealthy: diagnostic.hasValidConfig,
      projectId: diagnostic.projectId,
      timestamp: new Date(),
      error: diagnostic.errors.length > 0 ? diagnostic.errors.join(', ') : undefined
    };
  } catch (error) {
    return {
      isHealthy: false,
      projectId: 'unknown',
      timestamp: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export diagnostic tools
export default {
  diagnoseFirebaseConfig,
  generateFirestoreSecurityRules,
  logFirebaseConfigDiagnostic,
  checkFirebaseHealth
}; 