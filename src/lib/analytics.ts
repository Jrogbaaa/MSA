/**
 * Analytics Tracking System
 * 
 * This module provides analytics tracking for the MSA Properties application.
 * It supports multiple analytics providers and includes privacy-compliant tracking.
 */

export interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: Date;
}

export interface PropertyEvent extends AnalyticsEvent {
  propertyId: string;
  propertyTitle?: string;
  propertyRent?: number;
  propertyAvailability?: string;
}

// Analytics providers
type AnalyticsProvider = 'google' | 'mixpanel' | 'amplitude' | 'console';

class AnalyticsManager {
  private providers: Set<AnalyticsProvider> = new Set();
  private isInitialized = false;
  private queue: AnalyticsEvent[] = [];

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize based on environment variables
    if (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) {
      this.providers.add('google');
    }
    
    if (process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      this.providers.add('mixpanel');
    }
    
    // Always enable console logging in development
    if (process.env.NODE_ENV === 'development') {
      this.providers.add('console');
    }

    this.isInitialized = true;
    
    // Process queued events
    this.queue.forEach(event => this.trackEvent(event));
    this.queue = [];
  }

  /**
   * Track a generic analytics event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) {
      this.queue.push(event);
      return;
    }

    const enrichedEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };

    this.providers.forEach(provider => {
      this.sendToProvider(provider, enrichedEvent);
    });
  }

  /**
   * Track property-specific events
   */
  trackPropertyEvent(event: PropertyEvent): void {
    const propertyEvent: AnalyticsEvent = {
      ...event,
      category: 'Property Management',
      properties: {
        ...event.properties,
        propertyId: event.propertyId,
        propertyTitle: event.propertyTitle,
        propertyRent: event.propertyRent,
        propertyAvailability: event.propertyAvailability,
      },
    };

    this.trackEvent(propertyEvent);
  }

  private sendToProvider(provider: AnalyticsProvider, event: AnalyticsEvent): void {
    try {
      switch (provider) {
        case 'google':
          this.sendToGoogleAnalytics(event);
          break;
        case 'mixpanel':
          this.sendToMixpanel(event);
          break;
        case 'console':
          this.sendToConsole(event);
          break;
        default:
          console.warn(`Unknown analytics provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Analytics error for provider ${provider}:`, error);
    }
  }

  private sendToGoogleAnalytics(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_parameters: event.properties,
      });
    }
  }

  private sendToMixpanel(event: AnalyticsEvent): void {
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track(event.action, {
        category: event.category,
        label: event.label,
        value: event.value,
        ...event.properties,
      });
    }
  }

  private sendToConsole(event: AnalyticsEvent): void {
    console.log('📊 Analytics Event:', {
      action: event.action,
      category: event.category,
      label: event.label,
      value: event.value,
      properties: event.properties,
      timestamp: event.timestamp,
    });
  }
}

// Singleton instance
const analytics = new AnalyticsManager();

// Property-specific tracking functions
export const trackPropertyStatusChange = (
  propertyId: string,
  fromStatus: string,
  toStatus: string,
  propertyTitle?: string,
  propertyRent?: number
): void => {
  analytics.trackPropertyEvent({
    action: 'Property Status Changed',
    category: 'Property Management',
    label: `${fromStatus} → ${toStatus}`,
    propertyId,
    propertyTitle,
    propertyRent,
    propertyAvailability: toStatus,
    properties: {
      fromStatus,
      toStatus,
      changeMethod: 'Quick Toggle', // Indicates it was done via the Tag button
    },
  });
};

export const trackPropertyAction = (
  action: 'view' | 'edit' | 'delete' | 'create' | 'toggle_sold',
  propertyId: string,
  propertyTitle?: string,
  additionalProperties?: Record<string, any>
): void => {
  analytics.trackPropertyEvent({
    action: `Property ${action.charAt(0).toUpperCase() + action.slice(1)}`,
    category: 'Property Management',
    label: propertyTitle || propertyId,
    propertyId,
    propertyTitle,
    properties: additionalProperties,
  });
};

export const trackAdminAction = (
  action: string,
  label?: string,
  properties?: Record<string, any>
): void => {
  analytics.trackEvent({
    action,
    category: 'Admin',
    label,
    properties,
  });
};

export const trackUserAction = (
  action: string,
  category: string = 'User Interaction',
  label?: string,
  properties?: Record<string, any>
): void => {
  analytics.trackEvent({
    action,
    category,
    label,
    properties,
  });
};

// Performance tracking
export const trackPerformance = (
  metric: string,
  value: number,
  label?: string
): void => {
  analytics.trackEvent({
    action: 'Performance Metric',
    category: 'Performance',
    label: label || metric,
    value,
    properties: {
      metric,
    },
  });
};

// Error tracking
export const trackError = (
  error: Error,
  context?: string,
  properties?: Record<string, any>
): void => {
  analytics.trackEvent({
    action: 'Error',
    category: 'Errors',
    label: error.message,
    properties: {
      ...properties,
      context,
      stack: error.stack,
      name: error.name,
    },
  });
};

// Export the analytics instance and utilities
export default analytics;
export { analytics };
