# MSA Real Estate - Premium Property Platform for England 🇬🇧

A modern, mobile-first real estate website built with Next.js 15 and React 19, specifically designed for the UK property market. Features Firebase authentication, comprehensive tenant dashboard, document management, and a responsive design optimised for English property seekers.

## 🚀 Latest Updates (January 2025)

### ✨ Major Improvements
- **🎨 Enhanced Branding**: Dramatically enlarged MSA logo across all pages for better visibility
- **🇬🇧 UK Localization**: Complete localization for British market including:
  - GBP currency formatting (£1,200-£3,500/month)
  - British date format (DD/MM/YYYY) 
  - UK phone number formatting (+44, 07/01/02 prefixes)
  - English property addresses (Manchester, Birmingham, London)
  - British terminology ("properties" vs "apartments", "personalised" vs "personalized")
- **📄 Tenant Document Portal**: Comprehensive document management system
- **🔐 Enhanced Authentication**: "Tenant Sign In" for clear user identification
- **⚡ Next.js 15 + React 19**: Latest framework versions with improved performance

### 📁 Document Management Features
- **Lease Agreements**: View and download signed tenancy agreements
- **Insurance Policies**: Access tenant insurance documents
- **Maintenance Forms**: Submit and track maintenance requests
- **Document Status**: Real-time status tracking (signed, pending, expired)
- **Property Association**: Documents linked to specific properties
- **One-Click Downloads**: Easy document access with download functionality

## 🏠 Features

### Core Property Features
- **Property Listings** - UK properties with GBP pricing and British addresses
- **Property Details** - Full property information with photo galleries
- **Multi-Step Application** - Mobile-optimised tenancy application forms
- **Tenant Dashboard** - Application tracking, saved properties, and document access
- **Document Portal** - Lease agreements, insurance, and maintenance documents
- **Google Authentication** - Secure tenant login via Firebase Auth

### UK-Specific Features
- **British Currency**: All pricing in GBP (£) with proper formatting
- **UK Addresses**: Realistic English property locations across major cities
- **British Date Format**: DD/MM/YYYY throughout the application
- **UK Phone Numbers**: British telephone number formatting and validation
- **Local Terminology**: British English throughout (flats, properties, personalised)
- **UK Amenities**: British-specific amenities (roof terraces, underground parking)

### Mobile-First Design
- **Prominent Branding**: Large, visible MSA logo for professional presence
- **Touch-Friendly**: Optimized for mobile property browsing
- **Swipeable Galleries**: Touch-optimized photo navigation
- **One-Handed Use**: Easy navigation with thumb-friendly controls
- **Fast Loading**: Optimized images and performance
- **Responsive**: Perfect across all devices and screen sizes

### Technical Features
- **Next.js 15** with App Router and latest optimizations
- **React 19** with improved performance and features
- **TypeScript** for complete type safety
- **Tailwind CSS** for modern styling
- **Firebase** for authentication and secure data storage
- **Framer Motion** for smooth, professional animations
- **React Hook Form** with comprehensive validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.5, React 19.1.0, TypeScript 5.x
- **Styling**: Tailwind CSS 3.x, Radix UI components, ShadCN/UI
- **Authentication**: Firebase Auth v10+ (Google provider)
- **Database**: Firestore (Firebase) with UK data structure
- **Storage**: Firebase Storage for document and image uploads
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library
- **Deployment**: Vercel with automatic deployments

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Jrogbaaa/MSA.git
   cd MSA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file with Firebase configuration:
   ```env
   # Firebase Client Configuration (Required)
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

   # Firebase Service Account (For server-side operations)
   FIREBASE_SERVICE_ACCOUNT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your_service_account@your_project.iam.gserviceaccount.com
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account%40your_project.iam.gserviceaccount.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Project Structure

```
MSA/
├── public/
│   ├── logo.png              # MSA Real Estate logo (enlarged)
│   └── hero-images/          # Property and hero images
├── src/
│   ├── app/                  # Next.js 15 App Router
│   │   ├── apply/[id]/      # Tenancy application forms
│   │   ├── property/[id]/   # Individual property pages
│   │   ├── dashboard/       # Tenant dashboard with documents
│   │   ├── about/          # About and contact information
│   │   ├── layout.tsx      # Root layout with navigation
│   │   ├── page.tsx        # Homepage with property listings
│   │   └── globals.css     # Global styles and Tailwind
│   ├── components/
│   │   └── ui/             # Reusable UI components (ShadCN)
│   ├── hooks/
│   │   └── useAuth.tsx     # Firebase authentication context
│   ├── lib/
│   │   ├── firebase.ts     # Firebase configuration
│   │   └── utils.ts        # Utility functions (UK formatting)
│   └── types/
│       └── index.ts        # TypeScript definitions
├── .env.local              # Environment variables (not committed)
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## 📱 Pages & Features

### Homepage (`/`)
- **Property Grid**: UK properties with GBP pricing
- **Enhanced Logo**: Large, prominent MSA branding
- **Filtering**: Bedroom, bathroom, and price filters
- **British Addresses**: Manchester, Birmingham, London properties
- **Mobile Optimized**: Touch-friendly property cards

### Property Details (`/property/[id]`)
- **Photo Galleries**: High-quality property images
- **UK Specifications**: British property details and amenities
- **Contact Integration**: UK phone numbers and email
- **Application CTAs**: Direct links to tenancy applications
- **Responsive Design**: Perfect mobile and desktop viewing

### Tenant Dashboard (`/dashboard`)
- **Document Portal**: Complete document management system
  - Signed lease agreements
  - Insurance policies
  - Maintenance request forms
  - Real-time status tracking
- **Application Tracking**: Monitor tenancy application progress
- **Saved Properties**: Bookmarked properties with quick access
- **Statistics**: Personal dashboard with document counts
- **Profile Management**: Tenant profile and preferences

### Application Form (`/apply/[id]`)
- **Multi-Step Process**: Guided tenancy application
- **UK Data Fields**: British-specific form fields
- **Document Upload**: Secure file management
- **Auto-Save**: Progress preservation
- **Validation**: Comprehensive form validation

### About/Contact (`/about`)
- **Company Information**: MSA Real Estate details
- **Contact Form**: Direct communication (sends to 11jellis@gmail.com)
- **UK Contact Details**: British phone numbers and addresses
- **Professional Design**: Clean, trustworthy presentation

## 🔐 Authentication & Security

### Firebase Authentication
- **Google Sign-In**: Secure OAuth integration
- **Tenant Accounts**: User profile creation and management
- **Protected Routes**: Secure access to dashboard and applications
- **Session Management**: Automatic login persistence
- **Role-Based Access**: Tenant and admin role support

### Security Features
- **Environment Variables**: Secure API key management
- **Firebase Rules**: Database security rules
- **HTTPS Only**: Secure connections
- **Input Validation**: XSS and injection protection

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
- **Contact**: 11jellis@gmail.com
- **Phone**: +44 20 7123 4567

### Development Support
- **Issues**: Create GitHub issues for bugs or feature requests
- **Contributions**: Fork and submit pull requests
- **Documentation**: Comprehensive inline code documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

**Live Site**: [https://msa-git-main-jrogbaaa.vercel.app](https://msa-git-main-jrogbaaa.vercel.app)

Deployed on Vercel with:
- Automatic GitHub integration
- Environment variable management
- Custom domain support
- Performance monitoring
- Analytics integration

---

**Built with ❤️ for the UK property market**  
*Next.js 15 • React 19 • TypeScript • Tailwind CSS • Firebase*

*Professional property platform designed specifically for British tenants and property managers.* 