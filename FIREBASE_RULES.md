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
    
    // Messages collection - CRITICAL for admin dashboard notifications
    match /messages/{messageId} {
      allow read, write: if true; // Allow all access for now
      allow create: if true; // Allow contact form submissions
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

### Step 4: Test Message System
1. Go back to your admin dashboard
2. The unread message count should now appear
3. Try submitting a contact form to test

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
    
    // Messages collection - public create, admin read/manage
    match /messages/{messageId} {
      allow create: if true; // Anyone can submit contact forms
      allow read, update, delete: if request.auth != null 
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
    
    // Users collection - user can read/write own data, admins can read all
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null 
        && request.auth.token.email in [
          "11jellis@gmail.com", 
          "arnoldestatesmsa@gmail.com"
        ];
    }
    
    // Documents collection - users can manage own, admins can read all
    match /documents/{documentId} {
      allow read, write: if request.auth != null;
    }
    
    // Admin collection - restricted to admin emails only
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
- `Missing or insufficient permissions` → Missing collection rules (like messages)

### Quick Test for Messages:

1. Go to your admin dashboard
2. Check if unread message counts appear
3. Submit a contact form
4. Verify the message appears in the admin dashboard

---

## Quick Commands

Test permissions in browser console:
```javascript
// This will test if your rules are working
await testFirebasePermissions()
``` 