/**
 * Enhanced Error Tracking System
 * 
 * This module provides granular error tracking for Firebase operations
 * and other critical application errors.
 */

import { trackError } from './analytics';

export interface ErrorContext {
  operation: string;
  component?: string;
  userId?: string;
  propertyId?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

export interface FirebaseErrorDetails {
  code: string;
  message: string;
  operation: string;
  collection?: string;
  documentId?: string;
  retryAttempt?: number;
  networkStatus?: 'online' | 'offline';
}

class ErrorTracker {
  private errorQueue: Array<{ error: Error; context: ErrorContext }> = [];
  private isOnline = true;
  private maxQueueSize = 100;

  constructor() {
    this.initializeNetworkMonitoring();
  }

  private initializeNetworkMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Network back online, processing queued errors...');
      this.processErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('🌐 Network offline, errors will be queued');
    });
  }

  /**
   * Track Firebase-specific errors with detailed context
   */
  trackFirebaseError(error: Error, details: FirebaseErrorDetails): void {
    const context: ErrorContext = {
      operation: details.operation,
      component: 'Firebase',
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      additionalData: {
        firebaseCode: details.code,
        collection: details.collection,
        documentId: details.documentId,
        retryAttempt: details.retryAttempt,
        networkStatus: details.networkStatus || (this.isOnline ? 'online' : 'offline'),
        isFirebaseError: true,
      },
    };

    this.trackError(error, context);

    // Log specific Firebase error patterns
    this.logFirebaseErrorPattern(details);
  }

  /**
   * Track property management errors
   */
  trackPropertyError(
    error: Error, 
    operation: string, 
    propertyId?: string, 
    additionalData?: Record<string, any>
  ): void {
    const context: ErrorContext = {
      operation,
      component: 'PropertyManager',
      propertyId,
      timestamp: new Date(),
      additionalData: {
        ...additionalData,
        isPropertyError: true,
      },
    };

    this.trackError(error, context);
  }

  /**
   * Track authentication errors
   */
  trackAuthError(error: Error, operation: string, userId?: string): void {
    const context: ErrorContext = {
      operation,
      component: 'Authentication',
      userId,
      timestamp: new Date(),
      additionalData: {
        isAuthError: true,
      },
    };

    this.trackError(error, context);
  }

  /**
   * Track general application errors
   */
  trackError(error: Error, context: ErrorContext): void {
    const enrichedContext = {
      ...context,
      timestamp: context.timestamp || new Date(),
      userAgent: context.userAgent || (typeof window !== 'undefined' ? navigator.userAgent : undefined),
      url: context.url || (typeof window !== 'undefined' ? window.location.href : undefined),
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Tracked');
      console.error('Error:', error);
      console.log('Context:', enrichedContext);
      console.groupEnd();
    }

    // Queue error if offline
    if (!this.isOnline) {
      this.queueError(error, enrichedContext);
      return;
    }

    // Send to analytics
    this.sendErrorToAnalytics(error, enrichedContext);

    // Send to external error tracking service if configured
    this.sendToExternalService(error, enrichedContext);
  }

  private queueError(error: Error, context: ErrorContext): void {
    if (this.errorQueue.length >= this.maxQueueSize) {
      // Remove oldest error to make room
      this.errorQueue.shift();
    }

    this.errorQueue.push({ error, context });
  }

  private processErrorQueue(): void {
    while (this.errorQueue.length > 0) {
      const { error, context } = this.errorQueue.shift()!;
      this.sendErrorToAnalytics(error, context);
      this.sendToExternalService(error, context);
    }
  }

  private sendErrorToAnalytics(error: Error, context: ErrorContext): void {
    try {
      trackError(error, context.operation, {
        component: context.component,
        userId: context.userId,
        propertyId: context.propertyId,
        timestamp: context.timestamp,
        ...context.additionalData,
      });
    } catch (analyticsError) {
      console.error('Failed to send error to analytics:', analyticsError);
    }
  }

  private sendToExternalService(error: Error, context: ErrorContext): void {
    // Placeholder for external error tracking service (e.g., Sentry, LogRocket)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Would integrate with Sentry here
      console.log('📡 Would send to Sentry:', { error, context });
    }

    if (process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      // Would integrate with LogRocket here
      console.log('📡 Would send to LogRocket:', { error, context });
    }
  }

  private logFirebaseErrorPattern(details: FirebaseErrorDetails): void {
    // Track common Firebase error patterns for debugging
    const patterns = {
      'permission-denied': '🔒 Firebase permission denied - check Firestore rules',
      'failed-precondition': '⚠️ Firebase precondition failed - check document state',
      'internal': '🔥 Firebase internal error - may be temporary',
      'unavailable': '📡 Firebase unavailable - network or server issue',
      'deadline-exceeded': '⏱️ Firebase timeout - operation took too long',
      'resource-exhausted': '💾 Firebase quota exceeded - check usage limits',
      'unauthenticated': '🔐 Firebase unauthenticated - user needs to sign in',
    };

    const pattern = patterns[details.code as keyof typeof patterns];
    if (pattern) {
      console.warn(`${pattern} (${details.operation})`);
    }

    // Track retry patterns
    if (details.retryAttempt && details.retryAttempt > 1) {
      console.warn(`🔄 Firebase retry attempt ${details.retryAttempt} for ${details.operation}`);
    }
  }

  /**
   * Get error statistics for monitoring
   */
  getErrorStats(): {
    queuedErrors: number;
    isOnline: boolean;
    recentErrors: Array<{ operation: string; timestamp: Date; code?: string }>;
  } {
    return {
      queuedErrors: this.errorQueue.length,
      isOnline: this.isOnline,
      recentErrors: this.errorQueue.slice(-10).map(({ error, context }) => ({
        operation: context.operation,
        timestamp: context.timestamp,
        code: context.additionalData?.firebaseCode,
      })),
    };
  }
}

// Singleton instance
const errorTracker = new ErrorTracker();

// Convenience functions for different error types
export const trackFirebaseError = (error: Error, details: FirebaseErrorDetails): void => {
  errorTracker.trackFirebaseError(error, details);
};

export const trackPropertyError = (
  error: Error,
  operation: string,
  propertyId?: string,
  additionalData?: Record<string, any>
): void => {
  errorTracker.trackPropertyError(error, operation, propertyId, additionalData);
};

export const trackAuthError = (error: Error, operation: string, userId?: string): void => {
  errorTracker.trackAuthError(error, operation, userId);
};

export const trackAppError = (error: Error, context: ErrorContext): void => {
  errorTracker.trackError(error, context);
};

export const getErrorStats = () => errorTracker.getErrorStats();

// Enhanced Firebase error handler
export const handleFirebaseError = async (
  error: any,
  operation: string,
  options: {
    collection?: string;
    documentId?: string;
    retryAttempt?: number;
    fallbackAction?: () => void;
  } = {}
): Promise<void> => {
  // Extract Firebase error details
  const firebaseDetails: FirebaseErrorDetails = {
    code: error?.code || 'unknown',
    message: error?.message || 'Unknown Firebase error',
    operation,
    collection: options.collection,
    documentId: options.documentId,
    retryAttempt: options.retryAttempt,
    networkStatus: navigator.onLine ? 'online' : 'offline',
  };

  // Track the error
  trackFirebaseError(error, firebaseDetails);

  // Execute fallback action if provided
  if (options.fallbackAction) {
    try {
      options.fallbackAction();
    } catch (fallbackError) {
      console.error('Fallback action failed:', fallbackError);
    }
  }

  // Handle specific Firebase errors
  switch (error?.code) {
    case 'permission-denied':
      console.error('🔒 Firebase permission denied. User may need to sign in or lacks permissions.');
      break;
    case 'failed-precondition':
      console.error('⚠️ Firebase operation failed precondition. Document may be in invalid state.');
      break;
    case 'internal':
      console.error('🔥 Firebase internal error. This is usually temporary.');
      break;
    case 'unavailable':
      console.error('📡 Firebase service unavailable. Check network connection.');
      break;
    default:
      console.error(`🚨 Firebase error (${error?.code}):`, error?.message);
  }
};

export default errorTracker;
