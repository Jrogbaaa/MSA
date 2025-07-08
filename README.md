# MSA Real Estate Platform

A modern, mobile-first real estate platform built with Next.js, featuring streamlined property applications, advanced admin management, and seamless property browsing.

## 🌟 Features

### 🏠 **Property Management**
- Modern property listings with high-quality images
- **Multiple Image Upload**: Support for up to 20 images per property with drag-and-drop functionality
- **Base64 Image Storage**: Self-contained image storage with instant display
- Advanced filtering (bedrooms, bathrooms, price range)
- Detailed property pages with photo galleries
- Property saving functionality for logged-in users
- **Uniform Card Layout**: Consistent property card sizing across all listings
- Responsive grid layout optimized for all devices

### 📋 **Streamlined Application System**
- **Simplified Apply Form**: Quick 3-field form (name, email, phone only)
- **Instant Email Notifications**: Automatic emails to arnoldestates1@gmail.com
- **Real-time Application Tracking**: Applications saved instantly in admin dashboard
- **Professional Email Templates**: Comprehensive applicant and property details
- **One-Click Contact**: Direct email and phone buttons for applicants

### 📬 **Contact Management System**
- **Professional Contact Page**: Clean, responsive contact form with validation
- **Instant Message Storage**: All contact inquiries automatically saved to admin dashboard
- **Dual Email System**: EmailJS integration with mailto fallback for reliability
- **Real-time Admin Notifications**: Live contact message tracking with notification badges
- **Complete Message Management**: View, reply, and track all customer communications
- **Status Tracking**: Mark messages as New, Read, or Replied for organized follow-up

### 🔐 **Authentication System**
- **Google Sign-In**: One-click authentication with Google accounts
- **Email Registration**: Sign-up option for users without Google accounts
- **User Profiles**: Display user name and profile picture in navigation
- **Protected Routes**: Dashboard and saved properties require authentication
- **Persistent Sessions**: Stay logged in across browser sessions and page refreshes

### 👤 **User Dashboard**
- Personal dashboard showing applications and saved properties
- Application history and status tracking
- Profile management and settings
- Quick access to property favorites

### 🛡️ **Advanced Admin Panel**
- **Secure Admin Access**: Hardcoded admin authentication with fallback credentials
- **Property Management**: Add, edit, delete properties with advanced image upload
- **Application Management**: Complete application viewer and tracking system
  - Real-time application notifications with badge counters
  - Detailed applicant information display
  - One-click email and phone contact buttons
  - Application status tracking and management
- **Contact Message Management**: NEW - Professional contact inquiry system
  - Real-time contact message tracking and notifications
  - Complete message viewer with sender details and content
  - One-click reply and phone contact functionality
  - Message status management (New, Read, Replied)
  - Instant localStorage storage with cross-tab synchronization
- **Document Management**: Upload and manage tenant documents
- **Analytics Dashboard**: Live property and application statistics
- **Real-time Sync**: Cross-tab synchronization for instant updates

### 📱 **Modern UX/UI**
- **Mobile-First Design**: Optimized for smartphones and tablets
- **Progressive Web App**: Installable app experience
- **Hero Image Carousel**: Engaging homepage with rotating backgrounds
- **Loading States**: Smooth loading indicators and skeleton animations
- **Responsive Navigation**: Collapsible mobile menu
- **Professional Forms**: Clean, accessible form design with proper validation

### 🚀 **Performance & Data Management**
- **Next.js 15**: Latest React framework with App Router
- **LocalStorage Persistence**: Real-time data storage and synchronization
- **Image Optimization**: Base64 conversion for instant display
- **SEO Optimized**: Meta tags and structured data
- **Cross-tab Sync**: Real-time updates across multiple browser tabs
- **Automatic Deployment**: Vercel integration with GitHub push triggers

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **Authentication**: Firebase Auth with Google Provider + persistent sessions
- **Data Storage**: LocalStorage with real-time synchronization
- **Email**: Automatic mailto generation for admin notifications
- **Image Processing**: Base64 conversion with drag-and-drop upload
- **Deployment**: Vercel with automatic CI/CD from GitHub

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Jrogbaaa/MSA.git
cd MSA
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file with the following variables:
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Admin Credentials (hardcoded for security)
NEXT_PUBLIC_ADMIN_USERNAME=arnoldestatesmsa
NEXT_PUBLIC_ADMIN_PASSWORD=*#fhdncu^%!f
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

## 🔑 Access Credentials

### Admin Panel
- **URL**: `https://msaproperties.co.uk/admin/login`
- **Username**: `arnoldestatesmsa`
- **Password**: `*#fhdncu^%!f`

### User Authentication
- **Google Sign-In**: Available on all auth pages
- **Email Registration**: Available for users without Google accounts

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── admin/              # Admin panel pages
│   │   ├── login/          # Admin authentication
│   │   └── dashboard/      # Admin management interface with applications
│   ├── auth/               # User authentication pages
│   │   ├── signin/         # User login
│   │   └── signup/         # User registration
│   ├── dashboard/          # User dashboard
│   ├── property/[id]/      # Dynamic property pages
│   ├── apply/[id]/         # Simplified property application pages
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   └── layout.tsx          # Root layout with metadata
├── components/             # Reusable React components
│   ├── admin/              # Admin-specific components
│   │   └── PropertyManager.tsx  # Enhanced with 20-image upload
│   └── ui/                 # UI component library
├── hooks/                  # Custom React hooks
│   └── useAuth.tsx         # Enhanced authentication context
├── lib/                    # Utility libraries
│   ├── firebase.ts         # Firebase with persistent sessions
│   ├── adminAuth.ts        # Admin authentication
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript type definitions
├── data/                   # Static data and configurations
└── utils/                  # Additional utilities
```

## 🎯 Key Features Breakdown

### Application Flow
1. **User Clicks "Apply Now"** → Simple form with name, email, phone
2. **Instant Submission** → Application saved to localStorage + email sent
3. **Admin Notification** → Automatic email to arnoldestates1@gmail.com
4. **Admin Review** → View applications in dashboard Applications tab
5. **Contact Applicant** → One-click email/phone buttons

### Contact Management Flow
1. **User Submits Contact Form** → Professional form with name, email, phone, subject, message
2. **Dual Storage & Email** → Message saved to localStorage + EmailJS/mailto email sent
3. **Admin Dashboard Update** → NEW: Real-time message notification in Messages tab
4. **Admin Review** → View complete message details with sender information
5. **Professional Response** → One-click reply with pre-filled email templates
6. **Status Tracking** → Mark messages as New, Read, or Replied for organized follow-up

### Enhanced Admin Workflow
1. **Access Admin Panel** → Visit `/admin/login`
2. **Dashboard Overview** → Live property, application, and contact message statistics
3. **Property Management** → Upload up to 20 images per property
4. **Application Management** → View all applications with contact buttons
5. **Contact Message Management** → NEW: Professional message tracking and response system
6. **Real-time Updates** → Instant notifications for new applications and messages

### Image Upload System
1. **Drag & Drop Interface** → Modern file upload experience
2. **Multiple File Support** → Up to 20 images per property
3. **Base64 Conversion** → Self-contained storage with instant display
4. **Progress Indicators** → Visual feedback during upload
5. **Image Validation** → File type and size validation (5MB max)

## 🚀 Deployment

### Live Site
- **Production URL**: `https://msaproperties.co.uk`
- **Admin Panel**: `https://msaproperties.co.uk/admin/login`
- **Automatic Deployment**: Every GitHub push triggers Vercel rebuild

### Vercel Integration
```bash
# Automatic deployment configured with:
- GitHub repository: https://github.com/Jrogbaaa/MSA.git
- Branch: main
- Build command: npm run build
- Environment variables: Configured in Vercel dashboard
```

### Build Commands
```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

## 📊 Latest Improvements (December 2024)

### ✅ Application System Overhaul
- **Simplified Form**: Reduced from 5-step process to simple 3-field form
- **Instant Notifications**: Automatic emails to arnoldestates1@gmail.com
- **Admin Dashboard Integration**: Real-time application viewing and management
- **Contact Management**: One-click email and phone contact for applicants

### ✅ Image Management Enhancement
- **20-Image Limit**: Increased from single image to 20 images per property
- **Base64 Storage**: Self-contained image storage with instant display
- **Upload Progress**: Visual feedback with drag-and-drop interface
- **File Validation**: Type and size validation with user feedback

### ✅ UI/UX Improvements
- **Uniform Card Layout**: Fixed property card sizing inconsistencies
- **Responsive Design**: Enhanced mobile and tablet experience
- **Loading States**: Improved loading indicators and animations
- **Professional Forms**: Clean, accessible form design

### ✅ Admin Panel Enhancements
- **Application Management Tab**: Complete application viewer and tracker
- **Real-time Counters**: Live application count with notification badges
- **Contact Integration**: Direct email and phone links for applicants
- **Cross-tab Sync**: Real-time updates across multiple browser tabs

### ✅ Authentication Improvements
- **Persistent Sessions**: Users stay logged in across page refreshes
- **Enhanced Firebase Config**: Browser localStorage persistence
- **Better Error Handling**: Improved user feedback and error states

## 🔄 Data Flow

### Property Management
1. **Admin adds property** → Saved to localStorage with images
2. **Real-time sync** → Updates across all browser tabs instantly
3. **Homepage display** → Properties appear immediately on live site
4. **User interaction** → Filtering and browsing with live data

### Application Processing
1. **User submits application** → Data saved to localStorage
2. **Email notification** → Automatic email to arnoldestates1@gmail.com
3. **Admin notification** → Dashboard shows new application count
4. **Admin contact** → One-click email/phone contact with applicant

## 🛠️ Troubleshooting

### Common Issues
- **Applications not showing**: Check localStorage in browser dev tools
- **Images not displaying**: Verify base64 conversion completed
- **Admin login issues**: Use hardcoded credentials: `arnoldestatesmsa` / `*#fhdncu^%!f`
- **Email not opening**: Ensure default email client is configured

### Development Tips
- **Clear localStorage**: Reset demo data from admin panel
- **Check console**: Monitor for API and upload errors
- **Test responsiveness**: Verify mobile and tablet layouts
- **Verify emails**: Test mailto links open correctly

## 📞 Support

- **Admin Email**: arnoldestates1@gmail.com
- **Repository**: https://github.com/Jrogbaaa/MSA.git
- **Live Site**: https://msaproperties.co.uk

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies** 