# MSA Real Estate - Mobile-First Property Listings Platform (UK)

A modern, mobile-first real estate website built with Next.js 15, TypeScript, and Tailwind CSS. Features Google Firebase authentication, property listings, application management, and a responsive design optimised for mobile users across England.

## 🚀 Features

### Core Features
- **Property Listings** - Grid view of available properties with filtering and search
- **Property Details** - Full property information with photo galleries and application CTAs
- **Multi-Step Application Form** - Mobile-optimised form with document upload
- **User Dashboard** - Application status tracking and saved properties
- **Admin Dashboard** - Property management and application reviews (planned)
- **Google Authentication** - Secure login via Firebase Auth

### Mobile-First Design
- One-handed navigation with intuitive UI
- Swipeable photo galleries
- Touch-friendly buttons and inputs
- Progressive form completion with auto-save
- Fast loading with optimised images
- Responsive design across all devices

### Technical Features
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Firebase** for authentication and data storage
- **Framer Motion** for smooth animations
- **React Hook Form** with validation
- **Zod** for schema validation

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: Firebase Auth (Google provider)
- **Database**: Firestore (Firebase)
- **Storage**: Firebase Storage for document uploads
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd msa-real-estate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Firebase configuration:
   ```env
   # Firebase Client Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Service Account (for admin operations)
   FIREBASE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=your_client_x509_cert_url
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── apply/[id]/        # Application form page
│   ├── property/[id]/     # Property detail page
│   ├── dashboard/         # User dashboard
│   ├── about/            # About/Contact page
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── components/
│   └── ui/               # Reusable UI components
├── hooks/
│   └── useAuth.tsx       # Authentication context
├── lib/
│   ├── firebase.ts       # Firebase configuration
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript type definitions
```

## 📱 Pages Overview

### Homepage (`/`)
- Property grid with search and filtering
- Mobile-optimized card layout
- Quick property preview with key details
- Call-to-action buttons for viewing details or applying

### Property Details (`/property/[id]`)
- Full property information display
- Swipeable photo gallery with thumbnails
- Property specifications and amenities
- Contact forms and scheduling
- Direct application links

### Application Form (`/apply/[id]`)
- Multi-step form with progress indicator
- Steps: Personal Info → Employment → References → Documents → Review
- Auto-save functionality
- Document upload with file management
- Form validation with error handling

### User Dashboard (`/dashboard`)
- Application status tracking
- Saved properties management
- User profile settings
- Activity overview with statistics

### About/Contact (`/about`)
- Company information
- Contact form with validation
- Business hours and location
- Success/error message handling

## 🔐 Authentication

The application uses Firebase Authentication with Google Sign-In:

- **Sign In**: Google OAuth integration
- **User Management**: Profile creation and updates
- **Protected Routes**: Dashboard and application pages require authentication
- **Role-Based Access**: Support for tenant and admin roles

## 📊 Data Models

### Property
```typescript
interface Property {
  id: string;
  title: string;
  address: string;
  rent: number; // Monthly rent in GBP
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  description: string;
  amenities: string[];
  photos: string[];
  availability: 'available' | 'occupied' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}
```

### Application
```typescript
interface Application {
  id: string;
  userId: string;
  propertyId: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  personalInfo: PersonalInfo;
  employmentInfo: EmploymentInfo;
  references: Reference[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 Design System

The application uses a consistent design system with:

- **Colors**: Blue primary, gray neutrals, semantic colors for status
- **Typography**: Inter font family with clear hierarchy
- **Spacing**: Consistent padding and margins using Tailwind classes
- **Components**: Reusable UI components with variants
- **Responsive Breakpoints**: Mobile-first approach with responsive design

## 🚧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting (optional)
- **Component-based architecture**
- **Custom hooks** for reusable logic

## 📈 Performance Optimizations

- **Image Optimization**: Next.js Image component with lazy loading
- **Code Splitting**: Automatic with Next.js App Router
- **Tree Shaking**: Remove unused code
- **Mobile-First**: Optimized for mobile performance
- **Caching**: Browser and server-side caching strategies

## 🔮 Future Enhancements

- **Admin Dashboard**: Property management interface
- **Advanced Filtering**: More search criteria and sorting options
- **Real-time Notifications**: Updates on application status
- **Payment Integration**: Online rent payment system
- **Virtual Tours**: 360° property viewing
- **Map Integration**: Interactive property location maps
- **Offline Support**: PWA capabilities for offline viewing

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, email info@msarealestate.com or create an issue in the repository.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS 