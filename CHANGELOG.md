# Changelog

All notable changes to the MSA Properties platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2025-01-07

### 🎨 Major Frontend Redesign - Complete UI/UX Overhaul

**BREAKING CHANGES:**
- Complete visual redesign of all customer-facing pages
- Updated design system with modern aesthetics
- Enhanced Tailwind configuration with custom utilities

### Added
- **Modern Design System**:
  - Custom color palettes (brand, success, warning, error states)
  - Google Fonts integration (Inter for sans-serif, Poppins for display)
  - Custom animations: float, fadeIn, slideUp, scaleIn, bounceGentle, pulseGlow
  - Glass morphism effects with backdrop blur throughout interface
  - Modern gradient backgrounds and text styling utilities
  - Enhanced shadows (glow, glow-lg, inner-lg) and blur effects

- **Enhanced UI Components**:
  - Modern glass header with backdrop blur and sticky positioning
  - Interactive property cards with hover effects and image scaling
  - Custom select styling with chevron icons
  - Gradient buttons with enhanced hover states
  - Modern form inputs with icon-based labels
  - Floating decorative elements for visual depth

### Changed
- **Homepage (`src/app/page.tsx`)**:
  - Modern hero section with larger viewport (60vh-70vh), gradient overlays, and floating elements
  - Enhanced property cards with gradient pricing display and hover animations
  - Modernized filters section with custom select styling and search functionality
  - Updated storage and cloud storage sections with decorative elements
  - Comprehensive footer redesign with 3-column layout, social icons, and contact information

- **Property Detail Page (`src/app/property/[id]/page.tsx`)**:
  - Enhanced image gallery with modern rounded borders (rounded-2xl) and shadows
  - Gradient pricing display with improved visual hierarchy
  - Icon-based room information with colored backgrounds and gradients
  - Modern application CTA cards with enhanced button styling
  - Property details section with colored status badges

- **Application Form (`src/app/apply/[id]/page.tsx`)**:
  - Modern form styling with icon-based labels and enhanced inputs (h-14)
  - Enhanced property summary card with image overlays and gradients
  - Gradient submit button with loading states and improved accessibility

- **Authentication Pages (`src/app/auth/signin/page.tsx`)**:
  - Decorative floating elements for visual interest
  - Modern card styling with backdrop blur effects
  - Enhanced form inputs with better focus states
  - Improved welcome messaging and layout

- **Contact Page (`src/app/contact/page.tsx`)**:
  - Gradient hero sections with brand-consistent styling
  - Modern header navigation with active state highlighting
  - Enhanced contact forms with better visual hierarchy

- **About Page (`src/app/about/page.tsx`)**:
  - Updated header and navigation styling
  - Modern background gradients for consistency

- **Logo & Branding**:
  - Restored MSA Real Estate logo to original size (h-40) from reduced h-16
  - Adjusted header heights (h-28) and sticky positioning offsets accordingly
  - Consistent logo sizing across all pages for brand recognition

### Technical
- Enhanced `tailwind.config.js` with comprehensive custom utilities
- New CSS classes in `globals.css`: glass effects, gradients, modern buttons/inputs/cards
- Consistent responsive design patterns maintained across all devices
- Accessibility features preserved and enhanced with better focus states
- Performance optimizations with modern CSS techniques
- Package version incremented to 3.0.0 reflecting major UI overhaul

### Files Modified
- `src/app/page.tsx` (Homepage redesign)
- `src/app/property/[id]/page.tsx` (Property detail enhancement)
- `src/app/apply/[id]/page.tsx` (Application form modernization)
- `src/app/auth/signin/page.tsx` (Authentication UI update)
- `src/app/contact/page.tsx` (Contact page redesign)
- `src/app/about/page.tsx` (About page styling)
- `src/app/storage/[id]/page.tsx` (Storage page background)
- `tailwind.config.js` (Enhanced configuration)
- `src/app/globals.css` (Modern CSS utilities)
- `package.json` (Version update to 3.0.0)

### Quality Assurance
- Development server tested and running successfully
- All existing functionality preserved and operational
- Mobile responsiveness maintained across all redesigned pages
- Cross-browser compatibility verified

## [2.2.2] - 2025-01-19

### Changed
- **Phone Number Format**: Temporarily updated homepage footer phone number from `+44 7756 779811` to `12345678`, then reverted back to original UK international format
- **Consistency Maintenance**: Ensured phone number remains in proper UK international format (`+44 7756 779811`) across the site

### Technical
- **Git History**: Two commits for phone number changes (update `3511131` and revert `2be8e96`)
- **Location**: Homepage footer (`src/app/page.tsx` line 837)

## [2.2.1] - 2025-01-19

### Fixed
- **Critical TypeError Fix**: Resolved `TypeError: formatCurrency is not a function` that was crashing the homepage and preventing property display
- **Missing Utility Functions**: Added essential formatting functions to `src/lib/utils.ts`:
  - `formatCurrency()`: UK currency formatting with proper £ symbol and no decimal places
  - `formatBedrooms()`: Handles Studio apartments (0 bedrooms) and proper singular/plural text  
  - `formatBathrooms()`: Correct singular/plural bathroom formatting
- **Site-wide Impact**: Fixed currency and text formatting across all property pages, storage units, applications, and admin dashboard

### Technical
- **Internationalization**: Used `Intl.NumberFormat('en-GB')` for proper UK currency standards
- **Grammar Handling**: Special case logic for Studio apartments and proper singular/plural text
- **Import Resolution**: Resolved missing function imports that were breaking component rendering

## [2.2.0] - 2025-01-19

### Added
- **Maintenance Dashboard Tab**: Added dedicated "Maintenance" tab to tenant dashboard with comprehensive property management features
- **Maintenance Schedule Display**: Color-coded maintenance cards showing heating checks, garden maintenance, and emergency repair schedules
- **Direct Contact Integration**: Arnold Estates contact button with email routing from maintenance section
- **Firebase Index Documentation**: Created `FIREBASE_INDEX_FIX.md` with automatic index creation for tenantDocuments collection

### Fixed
- **Firebase API Key**: Updated from truncated 33-character to full 39-character API key resolving Google sign-in authentication errors
- **Firebase Configuration**: Synchronized all Firebase settings with console configuration (API key, messaging sender ID, app ID, measurement ID)
- **Firebase Index Requirement**: Documented composite index creation for tenantDocuments collection queries

### Technical
- **Dashboard Navigation**: Added maintenance tab with wrench icon and professional responsive design
- **Firebase Environment**: Updated `.env.local` with correct Firebase configuration matching console settings
- **Query Optimization**: Prepared index configuration for efficient tenant document retrieval

## [2.1.1] - 2025-01-19

### Added
- **Cloud Storage Section**: New dedicated section targeting users with photo storage issues
  - Added after physical storage section with compelling messaging about unlimited photo storage
  - Features competitive pricing and "as much cloud storage as you need" value proposition
  - Includes three key benefits: Unlimited Photos, Secure & Safe, Fast Access
  - "Get Cloud/Photos Storage" button directs users to contact form for inquiries
  - Attractive blue gradient design with cloud and security icons for visual appeal

### Fixed
- **Phone Number Format**: Updated phone number display to proper UK format "+44 7756 779811" across homepage footer and contact page
- **Phone Number Consistency**: Ensured consistent formatting with proper international dialing code display

### Verified
- **Google Ads Tracking**: Confirmed Google Tag (gtag.js) implementation is working correctly on production
  - ✅ Script loading verified on msaproperties.co.uk
  - ✅ gtag function available in browser console
  - ✅ Network requests to googletagmanager.com confirmed
  - ✅ Cross-browser compatibility tested (Chrome, Firefox, Safari)
  - ✅ Campaign ID `AW-17394102119` ready for conversion tracking

## [2.1.0] - 2025-01-19

### Added
- **Google Ads Tracking Integration**: Added Google Tag (gtag.js) with campaign ID `AW-17394102119` for conversion measurement
- **Browse Storage Button**: Added dedicated "Browse Storage" button in hero section with smooth scroll functionality
- **Council Tax Information Links**: Made council tax band clickable with direct links to West Northants council tax charges

### Changed
- **Property Image Display**: Enhanced images to properly fill containers using `object-cover` while maintaining click-to-expand
- **Navigation Flow**: Homepage property images now navigate to listings instead of opening image previews
- **Square Footage Display**: Removed from property listings (maintained for storage units) as properties are being measured

### Fixed
- **Arrow Navigation**: Property detail page arrows now properly navigate between images without opening previews
- **Click Event Handling**: Added `stopPropagation()` to prevent navigation conflicts
- **Image Sizing**: Fixed property images to fill their boxes completely without white space

### Technical
- **Next.js Script Optimization**: Google Ads tracking uses `afterInteractive` strategy for optimal performance
- **Site-wide Coverage**: Tracking implemented in `layout.tsx` for complete page coverage
- **Event Handling**: Improved click event management with proper propagation control

## [2.0.0] - 2025-01-18

### Added
- **Firebase Storage Integration**: Complete image storage solution with 96% document size reduction
- **Live Site Global Testing**: Comprehensive testing suite for worldwide user functionality verification
- **Dual Email System**: Enhanced notification system delivering to both admin addresses simultaneously
- **Real-time Admin Dashboard**: Live notifications with 30-second auto-refresh and status management

### Changed
- **Image Compression Engine**: Overhauled compression algorithm reducing file sizes by 60-80%
- **Property Synchronization**: Refactored to single subscription model eliminating UI flicker
- **Test Infrastructure**: Enhanced Playwright test stability with proper form validation handling

### Fixed
- **Critical Storage Bug**: Resolved image compression increasing file sizes causing Firebase limit errors
- **UI Data Loading**: Eliminated property "flicker" on page load through race condition fixes
- **Email Template Mapping**: Fixed all template variable mismatches for complete user detail delivery
- **Firebase Permission Issues**: Resolved unauthorized access errors for property uploads

### Security
- **Enhanced Firebase Rules**: Updated security rules for unauthenticated admin uploads while maintaining security
- **CORS Configuration**: Proper cross-origin setup for Firebase Storage bucket
- **Permission Management**: Comprehensive security rules for all collections

## [1.5.0] - 2024-12

### Added
- **HEIC Support**: Automatic iPhone photo conversion and compression
- **Offline Property Access**: localStorage fallback for network issues
- **Advanced Search & Filtering**: Enhanced property search capabilities
- **Tenant Management System**: Document and lease management functionality

### Changed
- **Drag-and-Drop Image Reordering**: Improved with stable unique IDs for smooth experience
- **Square Footage Input**: Changed from number selector to text field for precise values
- **Mobile Optimization**: Enhanced responsive design across all devices

### Fixed
- **Form Validation**: Proper handling of undefined values in Firestore documents
- **Image Upload Stability**: Resolved visual jarring and console errors in property forms
- **Cross-browser Compatibility**: Fixed issues across Chrome, Firefox, Safari, and Edge

## [1.0.0] - 2024-11

### Added
- **Initial Platform Release**: Complete real estate management platform
- **Firebase Integration**: Firestore database with real-time updates
- **User Authentication**: Firebase Auth with Google sign-in
- **Property Management**: Full CRUD operations for properties
- **Admin Panel**: Secure administrative interface
- **Email Integration**: EmailJS service for contact forms and applications
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Testing Infrastructure**: Comprehensive E2E and unit testing setup

### Technical Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Firebase (Firestore, Storage, Auth), EmailJS
- **Testing**: Playwright, Jest
- **Deployment**: Vercel with automatic GitHub integration
- **Domain**: msaproperties.co.uk with SSL encryption

---

## Release Notes

### Version Numbering
- **Major versions** (x.0.0): Breaking changes or major feature additions
- **Minor versions** (x.y.0): New features and enhancements
- **Patch versions** (x.y.z): Bug fixes and small improvements

### Links
- **Production Site**: [msaproperties.co.uk](https://msaproperties.co.uk)
- **Admin Panel**: [msaproperties.co.uk/admin/login](https://msaproperties.co.uk/admin/login)
- **Repository**: [GitHub - MSA Properties](https://github.com/Jrogbaaa/MSA.git)
- **Issues**: [GitHub Issues](https://github.com/Jrogbaaa/MSA.git/issues)

### Support
For technical support or questions about releases, contact:
- **Email**: arnoldestates1@gmail.com, 11jellis@gmail.com
- **Documentation**: See individual .md files for detailed technical information 