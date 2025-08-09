# Firebase Index Fix for MSA Properties

## 🚨 CRITICAL: Required Firebase Index

**Issue**: Firebase query requires a composite index for the `tenantDocuments` collection.

**Error Message**:
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/msa-48bd8/firestore/indexes?create_composite=ClFwcm9qZWN0cy9tc2EtNDhiZDgvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RlbmFudERvY3VtZW50cy9pbmRleGVzL18QARoMCgh0ZW5hbnRJZBABGg4KCnVwbG9hZERhdGUQAhoMCghfX25hbWVfXxAC
```

## 🔧 **How to Fix**

### Step 1: Click the Direct Link
**Click this link to automatically create the index**:
https://console.firebase.google.com/v1/r/project/msa-48bd8/firestore/indexes?create_composite=ClFwcm9qZWN0cy9tc2EtNDhiZDgvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RlbmFudERvY3VtZW50cy9pbmRleGVzL18QARoMCgh0ZW5hbnRJZBABGg4KCnVwbG9hZERhdGUQAhoMCghfX25hbWVfXxAC

### Step 2: Manual Creation (if link doesn't work)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select Project**: `msa-48bd8`
3. **Navigate to Firestore** → **Indexes**
4. **Click "Create Index"**
5. **Configure the index**:
   - **Collection ID**: `tenantDocuments`
   - **Fields to index**:
     - `tenantId` (Ascending)
     - `uploadDate` (Ascending)
     - `__name__` (Ascending)

### Step 3: Wait for Index Creation

- **Status**: Index will show "Building" status
- **Time**: Usually takes 1-5 minutes
- **Completion**: Status will change to "Enabled"

## 📊 **Index Details**

```
Collection: tenantDocuments
Fields:
  - tenantId (Ascending)
  - uploadDate (Ascending) 
  - __name__ (Ascending)
Query scopes: Collection
```

## 🎯 **What This Index Does**

This composite index allows efficient querying of tenant documents by:
- **Filtering** by `tenantId` (to get documents for a specific tenant)
- **Ordering** by `uploadDate` (to show newest documents first)
- **Unique identification** by `__name__` (document ID)

## ✅ **Verification**

After creating the index:

1. **Check index status** in Firebase Console → Firestore → Indexes
2. **Test the query** - revisit the tenant dashboard
3. **Verify documents load** without errors

## 🚨 **If Problems Persist**

If you still get index errors:

1. **Clear browser cache** and restart development server
2. **Check index status** - ensure it shows "Enabled"
3. **Wait longer** - complex indexes can take 10-15 minutes
4. **Verify collection name** - ensure it's exactly `tenantDocuments`

---

## 📁 **Related Documentation**

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - General Firebase configuration
- [FIREBASE_RULES.md](./FIREBASE_RULES.md) - Security rules setup
- [FIREBASE_API_KEY_FIX.md](./FIREBASE_API_KEY_FIX.md) - API key issues

---

**Status**: ⏳ Index creation required  
**Priority**: 🔴 High - Blocks tenant document functionality  
**Estimated Fix Time**: 5 minutes + index build time
