/**
 * Feature Flag Configuration
 * 
 * This module manages feature flags for the MSA Properties application.
 * Feature flags allow us to enable/disable features without code deployment.
 */

export interface FeatureFlags {
  // Property Management Features
  quickToggleSold: boolean;
  bulkPropertyActions: boolean;
  advancedPropertyFilters: boolean;
  
  // Admin Features
  propertyAnalytics: boolean;
  adminNotifications: boolean;
  
  // User Experience Features
  propertyComparison: boolean;
  savedSearches: boolean;
  virtualTours: boolean;
  
  // Performance Features
  lazyLoadImages: boolean;
  infiniteScroll: boolean;
}

// Default feature flag values
const defaultFlags: FeatureFlags = {
  // Property Management Features
  quickToggleSold: true, // ✅ Enabled - new quick toggle functionality
  bulkPropertyActions: false, // 🚧 Coming soon
  advancedPropertyFilters: false, // 🚧 Coming soon
  
  // Admin Features
  propertyAnalytics: true, // ✅ Enabled - basic analytics tracking
  adminNotifications: true, // ✅ Enabled - notification system
  
  // User Experience Features
  propertyComparison: false, // 🚧 Coming soon
  savedSearches: false, // 🚧 Coming soon
  virtualTours: false, // 🚧 Coming soon
  
  // Performance Features
  lazyLoadImages: true, // ✅ Enabled - performance optimization
  infiniteScroll: false, // 🚧 Coming soon
};

// Environment-based overrides
const getEnvironmentFlags = (): Partial<FeatureFlags> => {
  // In development, enable experimental features
  if (process.env.NODE_ENV === 'development') {
    return {
      bulkPropertyActions: true,
      advancedPropertyFilters: true,
      propertyComparison: true,
    };
  }
  
  // In production, use conservative defaults
  return {};
};

// Get feature flags from environment variables
const getEnvFlags = (): Partial<FeatureFlags> => {
  const envFlags: Partial<FeatureFlags> = {};
  
  // Check for environment variable overrides
  if (process.env.NEXT_PUBLIC_FEATURE_QUICK_TOGGLE_SOLD !== undefined) {
    envFlags.quickToggleSold = process.env.NEXT_PUBLIC_FEATURE_QUICK_TOGGLE_SOLD === 'true';
  }
  
  if (process.env.NEXT_PUBLIC_FEATURE_PROPERTY_ANALYTICS !== undefined) {
    envFlags.propertyAnalytics = process.env.NEXT_PUBLIC_FEATURE_PROPERTY_ANALYTICS === 'true';
  }
  
  if (process.env.NEXT_PUBLIC_FEATURE_BULK_ACTIONS !== undefined) {
    envFlags.bulkPropertyActions = process.env.NEXT_PUBLIC_FEATURE_BULK_ACTIONS === 'true';
  }
  
  return envFlags;
};

// Merge all feature flag sources
const getFeatureFlags = (): FeatureFlags => {
  return {
    ...defaultFlags,
    ...getEnvironmentFlags(),
    ...getEnvFlags(),
  };
};

// Cached feature flags
let cachedFlags: FeatureFlags | null = null;

/**
 * Get the current feature flags configuration
 */
export const getFlags = (): FeatureFlags => {
  if (!cachedFlags) {
    cachedFlags = getFeatureFlags();
    
    // Log feature flag status in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🏁 Feature Flags loaded:', cachedFlags);
    }
  }
  
  return cachedFlags;
};

/**
 * Check if a specific feature is enabled
 */
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  const flags = getFlags();
  return flags[feature];
};

/**
 * Reset cached flags (useful for testing)
 */
export const resetFlags = (): void => {
  cachedFlags = null;
};

/**
 * Override flags programmatically (useful for testing)
 */
export const overrideFlags = (overrides: Partial<FeatureFlags>): void => {
  const currentFlags = getFlags();
  cachedFlags = { ...currentFlags, ...overrides };
};

/**
 * Feature flag hooks for React components
 */
export const useFeatureFlag = (feature: keyof FeatureFlags): boolean => {
  return isFeatureEnabled(feature);
};

/**
 * Conditional rendering component based on feature flags
 * Note: This would be implemented as a React component in a .tsx file
 */
export const createFeatureFlagComponent = () => {
  // This function would return a React component when used in a .tsx file
  // For now, we'll just export the logic
  return null;
};

// Export feature flag utilities
export default {
  getFlags,
  isFeatureEnabled,
  resetFlags,
  overrideFlags,
  useFeatureFlag,
  createFeatureFlagComponent,
};
