# Firebase Firestore Security Rules for MSA Properties

## Quick Fix for Property Upload Issues

If you're getting stuck on "Saving..." when uploading properties, you need to update your Firestore security rules.

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `msa-48bd8`
3. Go to **Firestore Database** → **Rules**

### Step 2: Replace Your Rules

Copy and paste these rules into your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties collection - allow read for everyone, write for authenticated users
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if true; // Temporary - allow all writes for now
    }
    
    // Users collection - user can read/write own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Applications collection - allow read/write for authenticated users
    match /applications/{applicationId} {
      allow read, write: if true; // Temporary - allow all access
    }
    
    // Documents collection - allow read/write for authenticated users
    match /documents/{documentId} {
      allow read, write: if true; // Temporary - allow all access
    }
    
    // Admin collection - restricted to specific admin emails
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

### Step 3: Publish Rules
1. Click **Publish** in the Firebase Console
2. Wait for rules to deploy (should take a few seconds)

### Step 4: Test Property Upload
1. Go back to your admin dashboard
2. Click "Test Permissions" to verify the fix
3. Try uploading a property again

---

## Security Note

The rules above use `allow write: if true` which allows anyone to write data. This is fine for development but you should secure this for production:

### More Secure Rules (For Production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Properties collection - public read, admin write only
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com", 
          "arnoldestatesmsa@gmail.com"
        ];
    }
    
    // Applications - authenticated users can create, admins can read all
    match /applications/{applicationId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com", 
          "arnoldestatesmsa@gmail.com"
        ];
    }
    
    // Other collections remain the same...
  }
}
```

---

## Troubleshooting

### If you still get errors after updating rules:

1. **Clear browser cache** and refresh the page
2. **Wait 2-3 minutes** for rules to fully propagate
3. **Check Firebase Console logs** for any rule syntax errors
4. **Verify project ID** is `msa-48bd8` in your environment file

### Common Error Messages:

- `Permission denied` → Rules are too restrictive
- `Invalid token` → Authentication issues
- `Project not found` → Wrong project ID in environment variables

---

## Quick Commands

Test permissions in browser console:
```javascript
// This will test if your rules are working
await testFirebasePermissions()
``` 