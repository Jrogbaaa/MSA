# MSA Real Estate - Premium Property Platform for England 🇬🇧

A modern, mobile-first real estate website built with Next.js 15 and React 19, specifically designed for the UK property market. Features Firebase authentication, comprehensive tenant dashboard, document management, and a responsive design optimised for English property seekers.

## 🌟 Latest Features (January 2025)

### ✅ Recently Completed Updates
- **Hero Section Optimization**: Reduced height from full-screen to mobile-friendly proportions (`h-96 md:h-[500px]`)
- **Gold Street Property Enhanced**: Updated to £825/month with floor plan as final photo
- **Urgency Messaging**: Added "Only 2 left!" badges to encourage quick action
- **Browse Properties Button**: Now smoothly scrolls to properties section
- **EmailJS Complete Setup**: Fully configured with Service ID, Template ID, and Public Key
- **Direct Email Sending**: Forms now send emails directly to arnoldestates1@gmail.com without opening email client
- **Hero Slideshow Enhancement**: Fixed gray image issue with fresh Unsplash URLs and improved error handling
- **Property Gallery**: Complete 7-image gallery including floor plan for Gold Street

### 🏠 Gold Street Property Specifications
- **Address**: Gold Street, Northampton, NN1 1RS
- **Type**: Studio Flat
- **Rent**: £825/month
- **Bedrooms**: Studio (0 bedrooms)
- **Bathrooms**: 1
- **Size**: 450 sq ft
- **Features**: Modern open-plan living, kitchen with appliances, bathroom with shower
- **Location**: Northampton Town Centre, close to amenities and transport
- **Availability**: Available now - **Only 2 left!**
- **Photos**: 7 high-quality images including floor plan

## 🚀 Features

### Core Functionality
- **🏠 Property Listings**: Browse premium properties across England
- **🔍 Advanced Search**: Filter by price, bedrooms, bathrooms, and location
- **📱 Responsive Design**: Mobile-first approach optimized for all devices
- **🔒 Firebase Authentication**: Secure Google sign-in system
- **💾 Property Saving**: Save favorite properties to your account
- **📋 Application System**: Multi-step rental application process
- **📧 Contact System**: EmailJS integration with mailto fallbacks

### User Experience
- **🎬 Hero Slideshow**: Dynamic luxury apartment backgrounds with smooth transitions
- **⚡ Smooth Navigation**: Browse Properties button scrolls to listings
- **🔥 Urgency Messaging**: "Only 2 left!" badges for high-demand properties
- **📸 Property Galleries**: High-quality photos with floor plans
- **👤 User Dashboard**: Manage applications, saved properties, and documents
- **📞 Contact Forms**: Multiple contact options with professional email integration

### UK Localization
- **💷 British Currency**: All prices displayed in GBP (£)
- **🏴󠁧󠁢󠁥󠁮󠁧󠁿 UK Addresses**: Proper UK postcode formatting
- **📍 England Focus**: Properties across Manchester, Birmingham, London, and Northampton
- **🏢 Studio Flats**: Proper "Studio" display instead of "0 bedrooms"
- **📅 British Dates**: DD/MM/YYYY format throughout

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Backend**: Firebase (Authentication, Firestore)
- **Email**: EmailJS with mailto fallbacks
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Deployment**: Vercel with automatic GitHub integration
- **Images**: Next.js Image optimization

## 📧 EmailJS Configuration

### Step 1: Create EmailJS Account
1. Visit [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Setup Email Service
1. Go to **Email Services** in your EmailJS dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the authentication process
5. Note your **Service ID**

### Step 3: Create Email Template
1. Go to **Email Templates**
2. Click **Create New Template**
3. Use this template structure:

```html
Subject: {{subject}}

New contact form submission from MSA Real Estate:

Name: {{from_name}}
Email: {{from_email}}
Phone: {{phone}}
Subject: {{subject}}
Source: {{source}}

Message:
{{message}}

Submission Date: {{submission_date}}

Best regards,
MSA Real Estate Website
```

4. Note your **Template ID**

### Step 4: Get Public Key
1. Go to **Integration** → **Browser**
2. Copy your **Public Key**

### Step 5: Configure Environment Variables
Add these to your Vercel environment variables:

```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_rujk3lq
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_0npfw6f
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=BLj0_NFd1zPr-t0-E
```

**✅ CONFIGURED**: These values are already set up for MSA Real Estate.
**📧 RECIPIENT**: All emails are sent to arnoldestates1@gmail.com

### Step 6: Deploy
1. Push changes to GitHub
2. Vercel will automatically redeploy
3. EmailJS will now send emails directly without opening email client

**✅ READY TO DEPLOY**: EmailJS is configured and ready to send emails directly to arnoldestates1@gmail.com

**Note**: The system gracefully falls back to opening the user's email client if EmailJS fails for any reason.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project
- Vercel account (optional, for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/Jrogbaaa/MSA.git
cd MSA

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your Firebase and EmailJS configuration

# Run development server
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# EmailJS Configuration (✅ CONFIGURED)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_rujk3lq
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_0npfw6f
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=BLj0_NFd1zPr-t0-E
```

## 📱 Pages & Features

### Homepage (`/`)
- **Dynamic Hero Slideshow**: Luxury apartment interiors with 6-second transitions
- **Smart Filters**: Price range, bedrooms, bathrooms with UK-specific options
- **Property Grid**: Responsive cards with save functionality and urgency badges
- **Smooth Navigation**: Browse Properties button scrolls to listings

### Property Details (`/property/[id]`)
- **Photo Gallery**: High-quality images with navigation and thumbnails
- **Property Information**: Detailed specs, description, and amenities
- **Contact Options**: Schedule tours, phone, email integration
- **Urgency Indicators**: "Only 2 left!" messaging for high-demand properties

### Application System (`/apply/[id]`)
- **Multi-Step Process**: Personal info, employment, references, documents
- **Progress Tracking**: Visual step indicator
- **Email Notifications**: Detailed application emails to business

### User Dashboard (`/dashboard`)
- **Application Management**: Track application status and history
- **Saved Properties**: Manage favorite listings
- **Document Center**: Download leases, applications, insurance docs

### Contact & About (`/contact`, `/about`)
- **Professional Contact Forms**: EmailJS integration with fallbacks
- **Company Information**: About MSA Real Estate
- **Multiple Contact Methods**: Email, phone, and form submissions

## 🏗️ Project Structure

```
MSA/
├── public/
│   ├── logo.png              # MSA Real Estate logo (enlarged)
│   └── properties/           # Property images organized by property ID
│       └── 1/               # Gold Street property images
│           ├── main.jpg     # Primary property image
│           ├── 1.jpg        # Interior view 1
│           ├── 2.jpg        # Interior view 2
│           ├── 3.jpg        # Interior view 3
│           ├── 4.jpg        # Interior view 4
│           └── 5.jpg        # Interior view 5
├── src/
│   ├── app/                  # Next.js 15 App Router
│   │   ├── apply/[id]/      # Tenancy application forms
│   │   ├── property/[id]/   # Individual property pages
│   │   ├── dashboard/       # Tenant dashboard with documents
│   │   ├── about/          # About MSA Real Estate
│   │   ├── contact/        # Dedicated contact page
│   │   ├── layout.tsx      # Root layout with navigation
│   │   ├── page.tsx        # Homepage with property listings
│   │   └── globals.css     # Global styles and Tailwind
│   ├── components/
│   │   └── ui/             # Reusable UI components (ShadCN)
│   ├── hooks/
│   │   └── useAuth.tsx     # Firebase authentication context
│   ├── lib/
│   │   ├── firebase.ts     # Firebase configuration
│   │   ├── emailjs.ts      # EmailJS integration
│   │   └── utils.ts        # Utility functions (UK formatting)
│   └── types/
│       └── index.ts        # TypeScript definitions
├── .env.local              # Environment variables (not committed)
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3B82F6) - Trust and professionalism
- **Secondary**: Gray (#6B7280) - Neutral and modern
- **Accent**: Red (#EF4444) - Urgency and action
- **Success**: Green (#10B981) - Positive actions

### Typography
- **Font Family**: Inter (clean, professional, excellent readability)
- **Headings**: Bold weights for hierarchy
- **Body Text**: Regular weight, optimal line height

### Components
- **Cards**: Hover effects with subtle shadows
- **Buttons**: Touch-friendly sizing, clear CTAs
- **Forms**: Clean inputs with focus states
- **Navigation**: Large logo, clear menu structure

## 🚢 Deployment

### Automatic Deployment
The project is configured for automatic deployment:

1. **GitHub Integration**: Push to `main` branch triggers deployment
2. **Vercel Deployment**: Automatic builds and deployments
3. **Environment Variables**: Configured in Vercel dashboard
4. **Domain**: Custom domain configured if available

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

## 📊 Performance Features

- **Next.js Image Optimization**: Automatic image compression and sizing
- **Code Splitting**: Lazy loading of components and pages
- **Static Generation**: Pre-rendered pages for optimal performance
- **Mobile Optimization**: Touch-friendly interfaces and gestures
- **SEO Optimization**: Proper meta tags and structured data

## 🔐 Security Features

- **Firebase Authentication**: Secure Google sign-in
- **Environment Variables**: Sensitive data protection
- **Input Validation**: Form validation and sanitization
- **Error Handling**: Graceful error states and fallbacks
- **Offline Resilience**: Firebase offline error handling

## 📞 Contact & Communication

### Email Integration
- **Primary Email**: arnoldestates1@gmail.com
- **Contact Forms**: All forms send to primary email
- **EmailJS**: Direct email sending when configured
- **Mailto Fallbacks**: Email client opening when EmailJS unavailable

### Communication Features
- **Application Notifications**: Detailed emails with property and applicant info
- **Contact Form Submissions**: Professional formatted emails
- **Tour Requests**: Scheduled viewing submissions
- **Property Inquiries**: Direct contact for specific properties

## 🐛 Error Handling

### Image Loading
- **Hero Slideshow**: Graceful fallbacks for missing images
- **Property Photos**: Error states for broken images
- **Loading States**: Smooth transitions and feedback

### Email System
- **EmailJS Fallbacks**: Automatic mailto when service unavailable
- **User Feedback**: Clear messages about email status
- **Error Recovery**: Multiple contact methods available

### Offline Handling
- **Firebase Offline**: Graceful degradation when Firestore unavailable
- **User Creation**: Fallback user data when offline
- **State Management**: Robust error boundaries

## 📈 Recent Updates Log

### January 2025 - Major Enhancements
- ✅ **Hero Section Redesign**: Reduced height, improved mobile experience
- ✅ **Gold Street Property**: Updated to £825, added floor plan, urgency messaging
- ✅ **Navigation Enhancement**: Browse Properties button smooth scroll
- ✅ **EmailJS Integration**: Professional email system with fallbacks
- ✅ **Hero Slideshow Enhancement**: Fixed gray image issue with fresh Unsplash URLs and robust error handling
- ✅ **Error Handling**: Fixed image preloading and Firebase offline issues
- ✅ **Property Display**: Enhanced with urgency badges and better formatting
- ✅ **Documentation**: Comprehensive updates with EmailJS setup guide

### Previous Updates
- ✅ **Contact System**: Dedicated contact page with professional forms
- ✅ **Studio Display**: Proper "Studio" formatting instead of "0 bedrooms"
- ✅ **Property Images**: 6-image gallery for Gold Street property
- ✅ **Currency Localization**: Full GBP display throughout site
- ✅ **Slideshow Enhancement**: Luxury apartment backgrounds with smooth transitions
- ✅ **Firebase Integration**: User authentication and data management
- ✅ **Application System**: Multi-step rental applications with email notifications

## 📝 License

This project is private and proprietary to MSA Real Estate. All rights reserved.

---

## 📊 Data Models

### UK Property Model
```typescript
interface Property {
  id: string;
  title: string;
  address: string;           // UK addresses (Manchester, Birmingham, London)
  rent: number;             // Monthly rent in GBP
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  description: string;
  amenities: string[];      // UK-specific amenities
  photos: string[];
  availability: 'available' | 'occupied' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}
```

### Tenant Document Model
```typescript
interface TenantDocument {
  id: string;
  title: string;
  type: 'lease' | 'application' | 'insurance' | 'other';
  dateUploaded: Date;       // UK date format
  status: 'signed' | 'pending' | 'expired';
  downloadUrl: string;
  property?: string;        // Associated property
}
```

### User Model
```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photoURL?: string;
  role: 'tenant' | 'admin';
  savedProperties: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 Design System

### UK-Focused Design
- **Professional Branding**: Large MSA logo for trust and recognition
- **British Color Scheme**: Professional blue and gray palette
- **Clean Typography**: Inter font family for excellent readability
- **Consistent Spacing**: 8px grid system using Tailwind
- **Mobile-First**: Optimized for British mobile users
- **Accessibility**: WCAG 2.1 AA compliant design

### Component Library
- **ShadCN/UI**: Professional, accessible components
- **Radix Primitives**: Unstyled, accessible component primitives
- **Custom Components**: MSA-specific property and document components
- **Responsive Variants**: Mobile, tablet, and desktop optimizations

## 🇬🇧 UK Localization Details

### Currency & Pricing
- **GBP Formatting**: £1,200/month, £2,500/month
- **British Price Ranges**: Realistic UK rental prices
- **No Currency Conversion**: Native GBP throughout

### Date & Time
- **British Format**: DD/MM/YYYY (15/01/2024)
- **UK Date Picker**: British date selection
- **Timezone**: GMT/BST awareness

### Phone Numbers
- **UK Formats**: +44 20 7123 4567, 07123 456789
- **Mobile Prefixes**: 07xxx xxxx format
- **Landline Prefixes**: 01xxx, 02xxx formats

### Addresses & Locations
- **Real UK Cities**: Manchester, Birmingham, London
- **British Postcodes**: M1 4BH, B2 5AA, SW1A 1AA style
- **UK Property Types**: Flats, houses, maisonettes

### Language & Terminology
- **British English**: Colour, realise, personalised
- **Property Terms**: Flats vs apartments, properties vs units
- **Local Amenities**: Roof terrace, underground parking, lifts

## 🚧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint checks
npm run type-check   # TypeScript type checking
```

### Development Features
- **Hot Reload**: Instant updates during development
- **TypeScript**: Full type safety and IntelliSense
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting (optional)
- **Git Hooks**: Pre-commit quality checks

### Build & Deployment
- **Vercel Integration**: Automatic deployments from GitHub
- **Environment Management**: Separate staging and production configs
- **Performance Monitoring**: Core Web Vitals tracking
- **SEO Optimization**: Meta tags and structured data

## 📈 Performance & SEO

### Performance Optimizations
- **Next.js Image**: Automatic image optimization and lazy loading
- **Code Splitting**: Automatic with App Router
- **Tree Shaking**: Remove unused code
- **Bundle Analysis**: Webpack bundle analyzer
- **Core Web Vitals**: Optimized for Google's metrics

### SEO Features
- **Meta Tags**: Dynamic page titles and descriptions
- **Structured Data**: Property schema markup
- **Open Graph**: Social media sharing optimization
- **Sitemap**: Automatic sitemap generation
- **UK Geo-Targeting**: British search optimization

## 🔮 Future Enhancements

### Planned Features
- **Virtual Property Tours**: 360° viewing experiences
- **Advanced Search**: Postcode search, commute time filters
- **Rent Payment Portal**: Online payment processing
- **Maintenance Tracking**: Tenant maintenance request system
- **Admin Dashboard**: Property management interface
- **Mobile App**: React Native mobile application

### Technical Improvements
- **PWA Support**: Offline capability and app installation
- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Analytics**: Detailed usage and conversion tracking
- **API Development**: RESTful API for third-party integrations

## 📞 Contact & Support

### MSA Real Estate
- **Website**: [Live Demo](https://msa-git-main-jrogbaaa.vercel.app)
- **Repository**: [GitHub](https://github.com/Jrogbaaa/MSA.git)
- **Contact**: arnoldestates1@gmail.com
- **Phone**: +44 20 7123 4567

### Development Support
- **Issues**: Create GitHub issues for bugs or feature requests
- **Contributions**: Fork and submit pull requests
- **Documentation**: Comprehensive inline code documentation

---

## 🌐 Live Deployment

**Live Site**: [https://msa-git-main-jrogbaaa.vercel.app](https://msa-git-main-jrogbaaa.vercel.app)

**Built with ❤️ for the UK property market**  
*Next.js 15.3.5 • React 19.1.0 • TypeScript • Tailwind CSS • Firebase*

*Professional property platform designed specifically for British tenants and property managers.* 