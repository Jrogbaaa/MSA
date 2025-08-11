# Changelog

All notable changes to the MSA Properties platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.3.0] - 2025-01-19

### Added
- **Bubblegum UI Theme**: Integrated TweakCN's modern Bubblegum theme for professional, cohesive visual identity
- **shadcn/ui Component System**: Complete component management with `components.json` configuration
- **Modern Color Palette**: Soft pink/purple primary colors with warm accents using OKLCH color space
- **Typography Enhancement**: Modern font stack with Poppins (sans-serif), Lora (serif), and Fira Code (monospace)
- **Dark Mode Support**: Full dark theme implementation with complementary color adjustments
- **Design System**: Card-based layouts with subtle shadows and rounded corners

### Technical
- **@theme inline**: Added comprehensive Tailwind CSS variable mapping for seamless integration
- **OKLCH Color Space**: Enhanced accessibility and color perception accuracy
- **CSS Variable System**: Complete theme configuration with light/dark mode variants
- **Component Architecture**: shadcn CLI integration for consistent UI component management

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