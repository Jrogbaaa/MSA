# Firebase Domain Setup for MSA Properties

## ⚠️ CRITICAL: Firebase Authentication Domain Configuration

Now that you have set up custom domains (`msaproperties.co.uk` and `www.msaproperties.co.uk`), you **MUST** configure Firebase Authentication to allow these domains for user sign-in to work properly.

## 🚨 Required Action: Add Authorized Domains

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **msa-lettings-6b6f6**
3. Navigate to **Authentication** → **Settings** → **Authorized domains**

### Step 2: Add Your Custom Domains
You need to add these domains to the authorized domains list:

```
msaproperties.co.uk
www.msaproperties.co.uk
```

### Step 3: Firebase Console Instructions
1. In the **Authorized domains** section, click **Add domain**
2. Enter: `msaproperties.co.uk`
3. Click **Add**
4. Click **Add domain** again  
5. Enter: `www.msaproperties.co.uk`
6. Click **Add**

### Step 4: Verify Current Configuration
Your authorized domains should now include:
- ✅ `localhost` (for development)
- ✅ `msa-lettings-6b6f6.web.app` (Firebase hosting)
- ✅ `msa-lettings-6b6f6.firebaseapp.com` (Firebase auth domain)
- ✅ `*.vercel.app` (Vercel deployment - can be removed later)
- ✅ `msaproperties.co.uk` ← **NEW**
- ✅ `www.msaproperties.co.uk` ← **NEW**

## 🔧 Environment Variables Check

Your current Firebase configuration should be correct:

```bash
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=msa-lettings-6b6f6.firebaseapp.com
```

**Important**: Keep the `authDomain` as `msa-lettings-6b6f6.firebaseapp.com`. This is your Firebase project's auth domain and should NOT be changed to your custom domain.

## 🚀 What This Fixes

Adding these domains to Firebase Authentication authorized domains fixes:

1. **User Sign-In**: Users can now sign in on your custom domain
2. **Google Authentication**: Google OAuth will work on your custom domain
3. **Application Flow**: The "Apply Now" button will work properly
4. **Admin Login**: Admin authentication will work on custom domain
5. **Session Management**: User sessions will persist correctly

## ⚠️ Symptoms Without This Setup

If you don't add the authorized domains, users will see:
- "auth/unauthorized-domain" errors
- Sign-in buttons that don't work
- Redirects to Firebase auth domain instead of your site
- Application forms that fail to authenticate

## 🧪 Testing After Setup

1. Visit `https://msaproperties.co.uk`
2. Try to sign in using the sign-in page
3. Test the "Apply Now" button on a property
4. Verify admin login at `https://msaproperties.co.uk/admin/login`

## 📱 Additional Vercel Configuration

Your Vercel project should have these environment variables:

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

## 🔄 Deployment Status

✅ **Custom Domain**: Connected to Vercel  
✅ **SSL Certificate**: Automatic via Vercel  
✅ **DNS Configuration**: Properly configured  
🔄 **Firebase Auth Domains**: **ACTION REQUIRED** ← Add domains as described above  
✅ **Environment Variables**: Configured in Vercel  
✅ **Auto Deployment**: GitHub integration active  

## 📞 Post-Setup Verification Checklist

After adding the authorized domains in Firebase:

- [ ] Test user sign-in on `msaproperties.co.uk`
- [ ] Test "Apply Now" button functionality  
- [ ] Test admin login at `/admin/login`
- [ ] Verify contact forms work
- [ ] Check that property applications submit correctly
- [ ] Test authentication redirect flows

## 🚨 Important Notes

1. **Changes are immediate**: Firebase domain changes take effect immediately
2. **No code changes needed**: Your app code is already configured correctly
3. **Keep all existing domains**: Don't remove localhost or Firebase domains
4. **SSL is automatic**: Vercel handles SSL certificates for your custom domain

## 📋 Summary

**What you need to do RIGHT NOW:**
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add `msaproperties.co.uk`  
3. Add `www.msaproperties.co.uk`
4. Test sign-in functionality on your live site

**What's already configured:**
- ✅ Vercel custom domain setup
- ✅ Environment variables
- ✅ Firebase project configuration  
- ✅ EmailJS integration
- ✅ Auto-deployment from GitHub

Your site should be fully functional once the Firebase domains are added! 