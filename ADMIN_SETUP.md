# Admin System Setup Instructions

## Security Configuration

To secure the admin credentials properly, you need to add the following environment variables to your `.env.local` file:

```bash
# Admin Authentication
NEXT_PUBLIC_ADMIN_USERNAME=arnoldestatesmsa
NEXT_PUBLIC_ADMIN_PASSWORD=*#fhdncu^%!f
```

## Environment Variables Required

Create a `.env.local` file in the root directory with these variables:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDKRCtqZZxGhPHZcFZF6J7lKLOQyPzIVMc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=msa-lettings-6b6f6.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=msa-lettings-6b6f6
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=msa-lettings-6b6f6.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1002327485471
NEXT_PUBLIC_FIREBASE_APP_ID=1:1002327485471:web:2f4c2b3a5d6e7f8g9h0i

# EmailJS Configuration
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_rujk3lq
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_0npfw6f
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=BLj0_NFd1zPr-t0-E

# Admin Authentication
NEXT_PUBLIC_ADMIN_USERNAME=arnoldestatesmsa
NEXT_PUBLIC_ADMIN_PASSWORD=*#fhdncu^%!f
```

## Admin Access

1. **Login URL**: `/admin/login`
2. **Username**: `arnoldestatesmsa`
3. **Password**: `*#fhdncu^%!f`

## Features

- **Property Management**: Full CRUD operations for property listings
- **Session Management**: 24-hour session expiration
- **Security**: Environment variable-based authentication
- **Analytics**: Property statistics and overview dashboard

## Deployment

Make sure to configure these same environment variables in your Vercel deployment settings.

## Security Notes

- Admin credentials are stored in environment variables
- Session expires after 24 hours
- Access is restricted to authenticated admin users only
- All admin actions are logged for security auditing 