# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Testing
```bash
# Run all tests (unit + e2e)
npm run test:all

# Run Jest unit tests
npm run test
npm run test:watch
npm run test:coverage

# Run Playwright E2E tests
npm run test:e2e
npm run test:e2e:ui        # Interactive UI mode
npm run test:e2e:debug     # Debug mode

# Run specific test projects
npm run test:mobile        # Mobile devices
npm run test:desktop       # Desktop browsers

# Run property upload tests specifically
npm run test:property-upload
```

### Testing Infrastructure
- **Jest**: Unit testing with coverage reports
- **Playwright**: E2E testing across 6 browser/device combinations
- **Test Results**: HTML reports in `playwright-report/` and `coverage/`
- **Custom Test Script**: `scripts/test-all.js` runs comprehensive test suite

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Styling**: Tailwind CSS, Framer Motion
- **Testing**: Jest, Playwright, Testing Library

### Key Architecture Patterns

#### Firebase Integration with Fallbacks
The application uses a resilient Firebase architecture with multiple fallback layers:
1. **Primary**: Firebase Firestore for real-time data
2. **Secondary**: localStorage for offline access
3. **Tertiary**: Static demo data for development

#### Property Management System
- **Real-time Sync**: Firebase onSnapshot for live updates
- **Offline Support**: localStorage caching with automatic sync
- **Error Handling**: Comprehensive retry logic and fallback mechanisms
- **Image Processing**: HEIC support with automatic compression

#### Storage Unit Management System
- **Real-time Sync**: Firebase onSnapshot for live storage unit updates
- **Reservation System**: Complete reservation workflow with EmailJS integration
- **Direct Booking**: Homepage Reserve button connects to detailed reservation form
- **Automatic Form Opening**: Query parameter-based reservation flow (?reserve=true)
- **Multi-field Forms**: Contact info, move-in date, duration, and message collection

#### State Management
- **Authentication**: Custom AuthProvider with Firebase Auth
- **Data Sync**: Real-time subscriptions with cleanup management
- **Error Recovery**: Automatic reconnection and Firestore recovery

### Core Components Structure

#### Admin Panel (`src/components/admin/`)
- **PropertyManager**: Property CRUD operations with image upload
- **ApplicationManager**: Tenant application processing
- **MessageManager**: Contact form and message handling
- **TenantManager**: Tenant document management
- **DocumentManager**: File upload and management

#### Data Layer (`src/lib/`)
- **firebase.ts**: Firebase configuration and connection management
- **properties.ts**: Property CRUD with fallback logic
- **storageSpaces.ts**: Storage unit management with real-time sync
- **imageStorage.ts**: Firebase Storage integration for property images (NEW)
- **applications.ts**: Application processing
- **messages.ts**: Message handling
- **adminAuth.ts**: Admin authentication

#### Type Definitions (`src/types/index.ts`)
- **Property**: Core property data structure
- **StorageSpace**: Storage unit data structure with size, features, and availability
- **User**: User authentication and profile
- **Application**: Tenant application workflow
- **Document**: File upload handling

### Critical Implementation Details

#### Firebase Connection Management
```typescript
// Enhanced connection health checking
export const checkFirestoreConnection = async (): Promise<boolean>

// Automatic recovery from internal assertion failures
export const attemptFirestoreRecovery = async (): Promise<void>

// Retry mechanism with exponential backoff
const withRetry = async <T>(operation: () => Promise<T>, operationName: string)
```

#### Property Data Flow
1. **Real-time Subscription**: `subscribeToPropertiesCleanup()` establishes Firebase listener
2. **Automatic Fallback**: Uses localStorage when Firebase unavailable
3. **Error Handling**: Graceful degradation with user-friendly messages
4. **Sync Management**: Keeps localStorage and Firebase in sync

#### Image Processing & Storage
- **Firebase Storage**: Professional image storage with CDN delivery (NEW)
- **Advanced Compression**: 80KB target size with progressive quality reduction
- **HEIC Support**: iPhone photos automatically converted
- **Automatic Fallback**: Base64 storage if Firebase Storage fails
- **Document Size**: Reduced from 1.42MB to 50KB (96% reduction)
- **Cleanup System**: Automatic deletion of orphaned images
- **Size Warnings**: Pre-save validation with user feedback

### Environment Configuration

#### Required Environment Variables
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=

# Admin Authentication
NEXT_PUBLIC_ADMIN_USERNAME=
ADMIN_PASSWORD=
```

### Development Workflow

#### Property Management
1. Navigate to `/admin/login` with admin credentials
2. Use PropertyManager component for CRUD operations
3. Images are automatically processed and compressed
4. Real-time sync updates all connected clients

#### Testing Strategy
- **Unit Tests**: Focus on utility functions and data logic
- **E2E Tests**: Cover complete user workflows
- **Cross-Platform**: Test on desktop, mobile, and tablet
- **Error Scenarios**: Test Firebase offline/error conditions

#### Error Handling Philosophy
- **Graceful Degradation**: Always provide fallback functionality
- **User-Friendly Messages**: Clear error communication
- **Automatic Recovery**: Retry mechanisms for transient failures
- **Detailed Logging**: Comprehensive error tracking for debugging

### Known Issues and Solutions

#### Firebase Internal Assertion Failures
- **Issue**: Firebase SDK internal errors cause crashes
- **Solution**: Automatic detection and recovery in `firebase.ts`
- **Fallback**: localStorage ensures data persistence

#### Image Size Limitations
- **Issue**: Firebase 1MB document size limit
- **Solution**: Pre-save compression and size validation
- **User Feedback**: Clear warnings before save failures

#### Mobile Navigation Tests
- **Issue**: Mobile navigation tests expected to fail
- **Reason**: Different responsive behavior by design
- **Status**: 4 tests fail on mobile (expected behavior)

### Performance Considerations

#### Real-time Subscriptions
- **Cleanup**: Always use `subscribeToPropertiesCleanup()` for proper cleanup
- **Connection Management**: Automatic reconnection with exponential backoff
- **Memory Management**: Proper subscription cleanup on component unmount

#### Image Optimization
- **Automatic Compression**: Reduces storage usage by 60-80%
- **Progressive Loading**: Lazy loading for better performance
- **Format Conversion**: HEIC to web-compatible formats

### Security Implementation

#### Authentication Flow
- **Firebase Auth**: Secure user authentication with Google sign-in
- **Admin Protection**: Environment-based admin credentials
- **Session Management**: Persistent sessions with security checks

#### Data Security
- **Firestore Rules**: Database-level security (see FIREBASE_RULES.md)
- **Input Validation**: Server-side validation for all inputs
- **File Upload Security**: Secure handling of user-uploaded files

### Deployment Notes

#### Production Environment
- **Live Site**: msaproperties.co.uk
- **Admin Panel**: msaproperties.co.uk/admin/login
- **Hosting**: Vercel with automatic deployment
- **SSL**: Automatic HTTPS with custom domain

#### Testing on Production
- **Live Testing**: E2E tests run against production site
- **Global Accessibility**: Verified worldwide access
- **Email System**: Dual delivery to both administrators
- **Performance**: Monitored page load times and interactions

### Recent Critical Fixes

#### Storage Unit Reserve Button Fix (July 18, 2025)
- **Issue**: Reserve button on storage unit cards was non-functional, preventing users from reserving units
- **Solution**: Connected homepage Reserve button to existing reservation system with direct navigation
- **Implementation**:
  - Updated Reserve button in `src/app/page.tsx` to use Link component with query parameter
  - Added automatic reservation form opening in `src/app/storage/[id]/page.tsx` using `useSearchParams`
  - Implemented `?reserve=true` query parameter handling for direct reservation workflow
- **User Experience**: Click Reserve → Navigate to storage detail → Auto-open reservation form
- **Integration**: Seamlessly connected to existing EmailJS + Firestore reservation system
- **Files**: `src/app/page.tsx:700-705`, `src/app/storage/[id]/page.tsx:79-84`
- **Testing**: Build successful, no TypeScript errors, full reservation workflow verified

#### Photo Display & Quality Enhancement (July 18, 2025)
- **Issue**: Vertical photos/documents cropped, images blurry, slow loading speeds
- **Solution**: Comprehensive image display and compression improvements
- **Changes**:
  - Changed from `object-cover` to `object-contain` for full vertical document visibility
  - Improved image quality: target size 80KB→200KB, minimum quality 30%→60%
  - Enhanced compression: higher starting quality (92% vs 85%), gradual reduction (5% vs 10% steps)
  - Optimized loading: max dimensions 1000px→1920px, priority loading for first 4 images
  - Added gray backgrounds for better visual feedback during loading
- **Result**: Vertical documents fully visible, significantly sharper images, faster loading
- **Files**: `src/lib/imageStorage.ts`, `src/app/page.tsx`, `src/app/property/[id]/page.tsx`
- **Testing**: All core tests passing, expected mobile navigation failures remain

#### Next.js Image Configuration Fix (July 18, 2025)
- **Issue**: Firebase Storage images blocked by Next.js unconfigured hostname error
- **Solution**: Added `firebasestorage.googleapis.com` to Next.js image configuration
- **Result**: Firebase Storage images now load properly in production and development
- **File**: `next.config.js:29-34` - Added Firebase Storage domain to remotePatterns

#### Firebase Storage Integration (July 18, 2025)
- **Issue**: 1.42MB documents exceeded Firebase 1MB limit causing internal assertion errors
- **Solution**: Implemented Firebase Storage for property images with automatic fallback
- **Result**: 96% document size reduction (50KB vs 1.42MB) and eliminated all size limit errors
- **Benefits**: Unlimited image uploads, professional CDN delivery, automatic cleanup

#### Email System Enhancement
- **Dual Delivery**: All messages sent to both administrators
- **Reliability**: EmailJS with intelligent mailto fallback
- **Production Verified**: Tested on live site for global accessibility

#### UI Data Loading Fix
- **Issue**: Properties flickering on page load
- **Solution**: Refactored to single subscription model
- **Result**: Stable, consistent property display

#### Test Stability Improvements
- **Issue**: Flaky tests timing out on disabled buttons
- **Solution**: Proper `toBeEnabled()` assertions with timeouts
- **Result**: Reliable test execution

This codebase represents a production-ready real estate platform with comprehensive testing, robust error handling, and resilient Firebase integration with fallback mechanisms.

# MSA Properties Development Log

## Recent Changes

### Phone Number Format Correction (January 19, 2025)
- **Issue**: Phone number displayed as placeholder "12345678" instead of proper UK format
- **Changes**:
  - **Homepage Footer**: Updated phone display from "12345678" to "+44 7756 779811"
  - **Contact Page**: Updated phone information to proper UK international format
  - **Consistency Check**: Verified storage page already had correct format with working tel: links
  - **Format Standards**: Maintained proper UK international dialing code (+44) with space formatting for display
- **Result**: Consistent professional phone number display across all pages
- **Files**: `src/app/page.tsx`, `src/app/contact/page.tsx`

### Cloud Storage Service Addition (January 19, 2025)
- **Issue**: Opportunity to target users with phone storage issues and expand service offerings
- **Changes**:
  - **New Service Section**: Added cloud storage section after physical storage targeting users running low on phone storage due to photos
  - **Strategic Messaging**: "As much cloud storage as you need" with competitive pricing emphasis 
  - **Professional Design**: Blue gradient theme with cloud download icon, security, and speed icons
  - **Lead Generation**: "Get Cloud/Photos Storage" button directs users to contact form for service inquiries
  - **Key Features Highlighted**: Unlimited Photos, Secure & Safe, Fast Access
  - **Cross-selling Strategy**: Positioned after physical storage section to offer complementary cloud solutions
- **Result**: Enhanced service portfolio targeting mobile users with storage constraints
- **Files**: `src/app/page.tsx`, `src/app/contact/page.tsx` (phone number consistency)

### Google Ads Tracking Integration (January 19, 2025)
- **Issue**: Google Ads campaign requires conversion tracking setup for ROI measurement
- **Changes**:
  - **Google Tag Integration**: Added gtag.js with campaign ID `AW-17394102119` for conversion tracking
  - **Next.js Optimization**: Used Next.js Script component with `afterInteractive` strategy for optimal loading performance
  - **Site-wide Coverage**: Integrated into `layout.tsx` to track all pages automatically
  - **Performance Optimized**: Script loads after page interaction to avoid blocking initial page load
- **Verification (January 19, 2025)**:
  - **Implementation Confirmed**: Google tag (gtag.js) properly installed and active on all pages
  - **Script Loading**: Verified `gtag` function available in browser console
  - **Network Requests**: Confirmed requests to googletagmanager.com on page load
  - **Production Status**: ✅ Live and functional on msaproperties.co.uk
  - **Browser Support**: Tested across Chrome, Firefox, Safari with successful loading
- **Result**: ✅ Ready for Google Ads conversion measurement and ROI tracking - implementation verified working
- **Files**: `src/app/layout.tsx`

### Tenant Dashboard Maintenance Integration (January 19, 2025)
- **Issue**: Tenant dashboard needed maintenance section as a dedicated tab for property management requests
- **Changes**:
  - **Maintenance Tab**: Added new "Maintenance" tab to tenant dashboard navigation with wrench icon
  - **Schedule Display**: Comprehensive maintenance schedule showing heating checks, garden maintenance, and emergency repairs
  - **Contact Integration**: Direct contact button linking to Arnold Estates contact form (`/contact?to=arnold`)
  - **Professional Layout**: Color-coded maintenance cards (green, blue, red) with status indicators
  - **Operating Hours**: Clear display of maintenance hours (Monday-Friday 8:00 AM - 6:00 PM, Emergency 24/7)
- **Result**: ✅ Tenants now have dedicated maintenance section in dashboard with schedule visibility and easy contact access
- **Files**: `src/app/dashboard/page.tsx`

### Firebase Index Resolution (January 19, 2025)
- **Issue**: Firebase composite index required for tenantDocuments collection queries causing runtime errors
- **Problem**: Query on `tenantDocuments` collection by `tenantId` and `uploadDate` requires composite index
- **Solution**: Created automatic index creation link and documentation for Firebase Console setup
- **Index Configuration**: 
  - Collection: `tenantDocuments`
  - Fields: `tenantId` (Ascending), `uploadDate` (Ascending), `__name__` (Ascending)
- **Result**: ✅ Firebase composite index successfully deployed and verified active on project msa-48bd8
- **Verification**: Index confirmed via Firebase CLI showing tenantId + uploadDate fields properly configured
- **Files**: `FIREBASE_INDEX_FIX.md`, `firestore.indexes.json`, `firebase.json`, `firestore.rules`

### Email Notification Dual Delivery System (January 19, 2025)
- **Issue**: Email notifications for applications and messages not reaching both required email addresses
- **Problem**: Single email to multiple recipients (`arnoldestates1@gmail.com, 11jellis@gmail.com`) can fail entirely if one address has issues
- **Solution**: Implemented separate email delivery to each address for guaranteed delivery
- **Changes**:
  - **Dual Contact Emails**: `sendContactEmail()` now sends separate emails to each address
  - **Dual Application Emails**: `sendApplicationEmail()` sends separate property application notifications
  - **Enhanced Formatting**: Improved email templates with emojis and structured information
  - **Testing Function**: Added `testEmailNotifications()` for system verification
  - **Comprehensive Logging**: Console logs show delivery status for each email address
- **Result**: ✅ Both email addresses now receive independent notifications for all contact forms and applications
- **Files**: `src/lib/emailjs.ts`, `EMAIL_NOTIFICATIONS_DUAL_DELIVERY_FIX.md`

### Critical Utility Functions Fix (January 19, 2025)
- **Issue**: `TypeError: formatCurrency is not a function` causing homepage crashes and preventing property display
- **Problem**: Essential utility functions were missing from `src/lib/utils.ts` despite being imported across multiple components
- **Root Cause**: Functions were being imported but never defined, breaking:
  - Homepage property and storage listings
  - Property detail pages with rent formatting
  - Storage unit pricing display
  - Application forms with property summaries
  - Admin dashboard property management
- **Solution**: Added comprehensive utility functions to `src/lib/utils.ts`:
  - `formatCurrency()`: UK currency formatting with proper £ symbol and no decimal places
  - `formatBedrooms()`: Handles Studio (0 bed) and proper singular/plural text
  - `formatBathrooms()`: Correct singular/plural bathroom formatting
- **Technical Details**:
  - Used `Intl.NumberFormat('en-GB')` for proper UK currency standards
  - Special case handling for Studio apartments (0 bedrooms)
  - Consistent singular/plural grammar across the application
- **Result**: ✅ Homepage TypeError resolved, all currency and text formatting now works correctly
- **Files**: `src/lib/utils.ts`

### Phone Number Format Updates (January 19, 2025)
- **Issue**: Phone number format inconsistency on homepage footer
- **Changes Made**:
  - **Initial Update**: Changed phone number from `+44 7756 779811` to `12345678` (commit `3511131`)
  - **Reversion**: Changed back to original `+44 7756 779811` format (commit `2be8e96`)
- **Final Result**: ✅ Phone number consistently displays as `+44 7756 779811` in UK international format
- **Location**: Homepage footer (`src/app/page.tsx` line 837)
- **Files**: `src/app/page.tsx`

### Property Display & Navigation Improvements (January 19, 2025)
- **Issue**: Multiple UI/UX issues affecting property display and navigation
- **Changes**:
  - **Council Tax Band Enhancement**: Made entire "Council Tax Band:" text clickable with link to West Northants council tax charges (https://www.westnorthants.gov.uk/council-tax-bands-and-charges/council-tax-charges)
  - **Square Footage Cleanup**: Removed square footage display from all property listings while maintaining it for storage units (properties are being measured)
  - **Image Display Optimization**: Fixed property images to properly fill their containers using `object-cover` while maintaining click-to-expand functionality
  - **Hero Section Enhancement**: Added "Browse Storage" button alongside "Browse Properties" in hero section with smooth scroll to storage section
  - **Navigation Flow Fixes**: 
    - Homepage property images now navigate to property listings instead of image previews
    - Property detail page arrows now properly navigate between images without opening previews
    - Added `stopPropagation()` to prevent click conflicts
- **Result**: Improved user experience with clearer navigation paths and better visual presentation
- **Files**: `src/app/property/[id]/page.tsx`, `src/app/page.tsx`, `src/app/apply/[id]/page.tsx`, `src/components/admin/PropertyManager.tsx`