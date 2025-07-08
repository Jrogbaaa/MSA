# MSA Real Estate Platform

A modern, mobile-first real estate platform built with Next.js, featuring Google authentication, admin management, and seamless property browsing.

## 🌟 Features

### 🏠 **Property Management**
- Modern property listings with high-quality images
- Advanced filtering (bedrooms, bathrooms, price range)
- Detailed property pages with photo galleries
- Property saving functionality for logged-in users
- Responsive grid layout optimized for all devices

### 🔐 **Authentication System**
- **Google Sign-In**: One-click authentication with Google accounts
- **Email Registration**: Sign-up option for users without Google accounts
- **User Profiles**: Display user name and profile picture in navigation
- **Protected Routes**: Dashboard and saved properties require authentication
- **Session Management**: Persistent login state across browser sessions

### 👤 **User Dashboard**
- Personal dashboard showing applications and saved properties
- Document management (lease agreements, insurance, etc.)
- Application tracking and status updates
- Profile management and settings

### 🛡️ **Admin Panel**
- **Secure Admin Access**: Separate admin authentication system
- **Property Management**: Add, edit, and remove property listings
- **Document Management**: Upload and manage tenant documents
- **Application Review**: Track and manage property applications
- **Analytics Dashboard**: Overview of platform activity

### 📱 **Modern UX/UI**
- **Mobile-First Design**: Optimized for smartphones and tablets
- **Progressive Web App**: Installable app experience
- **Hero Image Carousel**: Engaging homepage with rotating backgrounds
- **Loading States**: Smooth loading indicators and animations
- **Responsive Navigation**: Collapsible mobile menu

### 🚀 **Performance & SEO**
- **Next.js 15**: Latest React framework with App Router
- **Image Optimization**: Automatic image compression and resizing
- **SEO Optimized**: Meta tags, sitemap, and structured data
- **PWA Ready**: Web app manifest and offline support
- **Firebase Integration**: Real-time database and authentication

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Authentication**: Firebase Auth with Google Provider
- **Database**: Firestore (NoSQL)
- **Email**: EmailJS for contact forms
- **Deployment**: Vercel with automatic CI/CD
- **Images**: Next.js Image Optimization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup
- EmailJS account (optional)

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

# EmailJS Configuration (Optional)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key

# Admin Credentials
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
- **URL**: `/admin/login`
- **Username**: `arnoldestatesmsa`
- **Password**: `*#fhdncu^%!f`

### User Authentication
- **Google Sign-In**: Available on all auth pages
- **Email Registration**: `/auth/signup`
- **Email Sign-In**: `/auth/signin`

## 📁 Project Structure

```
src/
├── app/                     # Next.js App Router pages
│   ├── admin/              # Admin panel pages
│   │   ├── login/          # Admin authentication
│   │   └── dashboard/      # Admin management interface
│   ├── auth/               # User authentication pages
│   │   ├── signin/         # User login
│   │   └── signup/         # User registration
│   ├── dashboard/          # User dashboard
│   ├── property/[id]/      # Dynamic property pages
│   ├── apply/[id]/         # Property application pages
│   ├── about/              # About page
│   ├── contact/            # Contact page
│   └── layout.tsx          # Root layout with metadata
├── components/             # Reusable React components
│   ├── admin/              # Admin-specific components
│   └── ui/                 # UI component library
├── hooks/                  # Custom React hooks
│   └── useAuth.tsx         # Authentication context
├── lib/                    # Utility libraries
│   ├── firebase.ts         # Firebase configuration
│   ├── adminAuth.ts        # Admin authentication
│   ├── emailjs.ts          # Email service
│   └── utils.ts            # Helper functions
├── types/                  # TypeScript type definitions
├── data/                   # Static data and configurations
└── utils/                  # Additional utilities
```

## 🎯 Key Features Breakdown

### Authentication Flow
1. **User Clicks "Tenant Sign In"** → Redirected to `/auth/signin`
2. **Google Sign-In Option** → One-click authentication
3. **Email Sign-Up Available** → For users without Google accounts
4. **Successful Login** → Redirected to `/dashboard`
5. **Profile Display** → Name and photo shown in navigation

### Admin Workflow
1. **Access Admin Panel** → Visit `/admin/login`
2. **Secure Authentication** → Admin credentials required
3. **Dashboard Overview** → Property and user statistics
4. **Property Management** → Add, edit, remove listings
5. **Document Management** → Upload tenant documents
6. **Application Review** → Track user applications

### Property Browsing
1. **Homepage Hero** → Rotating background images
2. **Filter Properties** → By bedrooms, bathrooms, price
3. **View Details** → Comprehensive property information
4. **Save Properties** → Bookmark favorites (requires login)
5. **Apply for Property** → Submit rental applications

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. **Connect GitHub Repository** to Vercel
2. **Environment Variables** → Add all `.env.local` variables to Vercel
3. **Automatic Deployment** → Every push to main branch deploys automatically
4. **Custom Domain** → Configure `msaproperties.co.uk`

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

## 📊 Recent Improvements

### Performance Optimizations
- ✅ **Image Performance**: Added `sizes` attributes to all images
- ✅ **PWA Support**: Web app manifest for installable experience
- ✅ **Offline Support**: Firestore persistence for offline functionality
- ✅ **Build Optimization**: Resolved all build warnings and errors

### Authentication Enhancements
- ✅ **Google Sign-In**: Improved flow with profile picture display
- ✅ **Loading States**: Better UX during authentication
- ✅ **Redirect Logic**: Proper handling of return URLs
- ✅ **Session Management**: Persistent authentication state

### Console Error Fixes
- ✅ **Web Manifest**: Eliminated 404 errors for PWA manifest
- ✅ **Image Warnings**: Fixed Next.js image optimization warnings
- ✅ **Firestore Errors**: Improved connection handling and offline support
- ✅ **SEO Files**: Added robots.txt and favicon files

## 🛠️ Development Notes

### Firebase Setup
- **Authentication**: Google provider configured with proper scopes
- **Firestore**: Real-time database with offline persistence
- **Security Rules**: Configured for user data protection
- **Storage**: Set up for property images and documents

### Admin Features
- **Property Manager**: Full CRUD operations for listings
- **Document Manager**: Upload and organize tenant documents
- **User Management**: View and manage user accounts
- **Analytics**: Track platform usage and applications

### Contact System
- **EmailJS Integration**: Direct email sending from contact forms
- **Fallback System**: Mailto links when EmailJS unavailable
- **Form Validation**: Client-side and server-side validation
- **Success States**: Clear confirmation messages

## 🔧 Troubleshooting

### Common Issues
1. **Build Errors**: Check environment variables are properly set
2. **Firebase Errors**: Verify Firebase configuration in console
3. **Image Loading**: Ensure image domains are configured in `next.config.js`
4. **Admin Access**: Confirm admin credentials are correct

### Console Warnings
- **Image Sizes**: All images now have proper `sizes` attributes
- **Manifest Errors**: Web manifest file created and configured
- **Firestore Warnings**: Offline persistence enabled for better reliability

## 📞 Support

For technical support or questions:
- **Email**: arnoldestates1@gmail.com
- **GitHub Issues**: Create issues for bugs or feature requests
- **Documentation**: Refer to inline code comments

## 📄 License

This project is proprietary software for MSA Real Estate.

---

**Built with ❤️ by MSA Real Estate Team** 