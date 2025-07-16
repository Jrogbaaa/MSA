# Firebase API Key Fix for MSA Properties

## 🚨 CRITICAL ISSUE: Invalid Firebase API Key

**Problem**: Your Firebase API key is invalid, causing authentication failures and Google Identity Toolkit errors.

**Symptoms**:
- `API key not valid. Please pass a valid API key.` errors in console
- Authentication not working properly
- Google sign-in failures

## 🔧 **How to Fix the API Key**

### Step 1: Get the Correct API Key from Firebase Console

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `msa-48bd8`
3. **Navigate to Project Settings**:
   - Click the gear icon ⚙️ in the left sidebar
   - Select "Project settings"
4. **Scroll to "Your apps" section**
5. **Find your Web app** (should be named something like "MSA Properties")
6. **Click "Config" or the `</>` icon**
7. **Copy the complete firebaseConfig object**

### Step 2: Update Your Environment Variables

Your `.env.local` file should look like this with the **correct** values from Firebase:

```env
# Firebase Configuration - UPDATE THESE WITH CORRECT VALUES FROM FIREBASE CONSOLE
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (FULL KEY FROM FIREBASE)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=msa-48bd8.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=msa-48bd8
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=msa-48bd8.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=... (FROM FIREBASE)
NEXT_PUBLIC_FIREBASE_APP_ID=... (FROM FIREBASE)
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=... (FROM FIREBASE)

# EmailJS Configuration (keep these as they are working)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_rujk3lq
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=template_0npfw6f
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=BLj0_NFd1zPr-t0-E

# Admin Authentication
NEXT_PUBLIC_ADMIN_USERNAME=arnoldestatesmsa
NEXT_PUBLIC_ADMIN_PASSWORD=your_admin_password
```

### Step 3: Update Vercel Environment Variables

If you're using Vercel (which you are), you also need to update the environment variables there:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: MSA Properties
3. **Go to Settings** → **Environment Variables**
4. **Update these variables** with the correct values from Firebase:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

### Step 4: Redeploy

After updating Vercel environment variables:
1. **Trigger a redeploy** (push any small change to GitHub)
2. **Or manually redeploy** from Vercel dashboard

## 🔍 **How to Verify the Fix**

### Local Testing:
1. **Restart your dev server**: `npm run dev`
2. **Check browser console** - the API key error should be gone
3. **Test Firebase permissions**: Run `testFirebasePermissions()` in console

### Production Testing:
1. **Visit**: https://msaproperties.co.uk
2. **Check console** - no API key errors
3. **Test authentication** - try signing in
4. **Test admin panel** - try accessing admin dashboard

## 🚨 **Important Notes**

### Firebase Project Confusion
I notice your project ID is `msa-48bd8` but some documentation references `msa-lettings-6b6f6`. Make sure you're using the **correct project** (`msa-48bd8`).

### API Key Format
A valid Firebase API key should:
- Start with `AIza`
- Be around 39 characters long
- Look like: `AIzaSyDKRCtqZZxGhPHZcFZF6J7lKLOQyPzIVMc`

### Current Invalid Key
Your current key `AIzaSyAt4nQrGJI7YQBbzAkEfVCJKLMNhbds` appears truncated (only 33 characters).

## 🎯 **Expected Results After Fix**

✅ **No more API key errors** in console  
✅ **Firebase authentication working** properly  
✅ **Admin dashboard messages** displaying correctly  
✅ **Google sign-in functioning** (if enabled)  
✅ **All Firebase operations** working normally  

## 🔧 **Quick Verification Command**

After fixing the API key, run this in your browser console:
```javascript
// Test Firebase configuration
import('./src/lib/firebase.ts').then(({ testFirebasePermissions }) => 
  testFirebasePermissions().then(result => {
    console.log('Firebase Test Results:', result);
    console.log('Messages Permission:', result.messagesPermission ? '✅ WORKING' : '❌ BLOCKED');
  })
);
```

---

## 📞 **If You Still Have Issues**

1. **Double-check project ID**: Ensure you're in the `msa-48bd8` project in Firebase Console
2. **Create new API key**: In Firebase Console → Project Settings → General → Web API Key
3. **Check browser cache**: Clear cache and try again
4. **Verify environment files**: Make sure both local `.env.local` and Vercel are updated

The **EmailJS system is working perfectly** (you received emails with full details), so once this API key is fixed, everything should work smoothly! 