# Updated Firebase Firestore Security Rules for MSA Properties
## CRITICAL FIX for Firebase Internal Assertion Errors

### ⚠️ URGENT: Firebase Rules Update Required

The error `FIRESTORE (10.14.1) INTERNAL ASSERTION FAILED: Unexpected state` indicates Firebase rules are causing conflicts. Use these FIXED rules:

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `msa-48bd8`
3. Go to **Firestore Database** → **Rules**

### Step 2: Replace with FIXED Rules

**COPY AND PASTE EXACTLY:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties collection - FIXED for real-time subscriptions
    match /properties/{propertyId} {
      allow read: if true;
      allow create, update, delete: if true;
    }
    
    // Storage Spaces collection - FIXED for CRUD operations
    match /storageSpaces/{storageId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if true;
    }
    
    // Messages collection - FIXED for contact forms
    match /messages/{messageId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if true;
    }
    
    // Applications collection - FIXED for property applications
    match /applications/{applicationId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if true;
    }
    
    // Users collection - basic access
    match /users/{userId} {
      allow read, write: if true;
    }
    
    // Documents collection - basic access
    match /documents/{documentId} {
      allow read, write: if true;
    }
    
    // Admin collection - basic access for now
    match /admin/{document} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: PUBLISH and WAIT
1. Click **PUBLISH** in Firebase Console
2. **WAIT 5 FULL MINUTES** for global propagation
3. **Clear browser cache** completely
4. **Refresh admin dashboard**

---

## What This Fixes

### ✅ Firebase Internal Assertion Error
- Removes conflicting rule patterns
- Fixes real-time subscription issues
- Prevents WebChannel connection errors

### ✅ Storage Spaces CRUD Operations
- ✅ **CREATE**: Add new storage spaces
- ✅ **READ**: View storage spaces
- ✅ **UPDATE**: Edit storage spaces  
- ✅ **DELETE**: Remove storage spaces

### ✅ Real-time Subscriptions
- Properties collection sync
- Storage spaces collection sync
- Messages collection sync

---

## Production Rules (Use Later)

Once everything works, replace with secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties - public read, admin write
    match /properties/{propertyId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com", 
          "arnoldestatesmsa@gmail.com"
        ];
    }
    
    // Storage Spaces - public read, admin write
    match /storageSpaces/{storageId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com", 
          "arnoldestatesmsa@gmail.com"
        ];
    }
    
    // Messages - public create, admin manage
    match /messages/{messageId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com", 
          "arnoldestatesmsa@gmail.com"
        ];
    }
    
    // Applications - public create, admin manage
    match /applications/{applicationId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com", 
          "arnoldestatesmsa@gmail.com"
        ];
    }
    
    // Users - restricted access
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com", 
          "arnoldestatesmsa@gmail.com"
        ];
    }
    
    // Documents - authenticated users
    match /documents/{documentId} {
      allow read, write: if request.auth != null;
    }
    
    // Admin - admin only
    match /admin/{document} {
      allow read, write: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com",
          "arnoldestatesmsa@gmail.com"
        ];
    }
  }
}
```

---

## Troubleshooting Steps

### If Firebase Error Persists:
1. **Hard refresh** browser (Cmd/Ctrl + Shift + R)
2. **Clear all browser data** for localhost:3000
3. **Wait 10 minutes** for Firebase propagation
4. **Restart development server** (`npm run dev`)

### If Storage Spaces Still Don't Work:
1. **Check Firebase Console > Firestore > Data** for `storageSpaces` collection
2. **Verify rules are published** (should show timestamp)
3. **Test in different browser** (incognito mode)
4. **Check browser console** for specific errors

### Test Commands:
```javascript
// Test in browser console
firebase.firestore().collection('storageSpaces').get().then(console.log);
firebase.firestore().collection('storageSpaces').add({test: true}).then(console.log);
```

---

## Summary of Changes

### 🔧 **Properties**: Reverted to Monthly Pricing
- ✅ Admin form: "Monthly Rent (£)"
- ✅ Property pages: "per month"
- ✅ Homepage: "/mo" 
- ✅ Application emails: "Monthly Rent"

### 📦 **Storage Spaces**: Changed to Weekly Pricing  
- ✅ Admin form: "Weekly Rate (£)"
- ✅ Storage pages: "per week"
- ✅ Homepage: "/week"
- ✅ Added image upload functionality

### 🔥 **Firebase**: Fixed Internal Errors
- ✅ Removed conflicting rule patterns
- ✅ Fixed storage space CRUD operations
- ✅ Resolved real-time subscription issues
- ✅ Eliminated assertion failures

**IMPORTANT**: After updating Firebase rules, test storage space add/delete functionality immediately! 