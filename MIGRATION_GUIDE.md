# User Roles Migration Guide

## Overview
This guide will help you migrate existing user roles from the `users` collection to the new secure `user_roles` collection in Firebase.

## Why Migrate?
- **Security**: Prevents privilege escalation attacks by separating role data
- **Better Structure**: Clean separation of profile data and authorization data
- **Audit Trail**: Track when and by whom roles were assigned

---

## Migration Steps

### Step 1: Backup Your Data
Before running any migration, **backup your Firebase database**:
1. Go to Firebase Console → Firestore Database
2. Click on "Export" (top right)
3. Save the backup locally

### Step 2: Update Firebase Security Rules
1. Open Firebase Console
2. Go to Firestore Database → Rules
3. Copy and paste the rules from `FIREBASE_SECURITY_RULES.md`
4. Click "Publish"

### Step 3: Run the Migration

#### Option A: Using the Admin Panel (Recommended)
1. Login as an admin user
2. Navigate to: `/admin/migrate-roles`
3. Read the instructions on the page
4. Click "Start Migration"
5. Wait for completion (you'll see a success message)

#### Option B: Using Browser Console
1. Login to your app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run:
```javascript
import { runMigration } from './scripts/migrateUserRoles';
runMigration();
```

### Step 4: Verify the Migration
1. Check Firebase Console → Firestore Database
2. Verify `user_roles` collection exists with documents
3. Verify each user has a corresponding role document
4. Check that role field is removed from `users` collection

### Step 5: Test Your App
1. **Logout** and **Login** again
2. Test role-based features:
   - Tenant: Can see own bookings only
   - Owner: Can see properties and related bookings
   - Admin: Can see all data
3. Verify permissions work correctly

### Step 6: Clean Up
1. Delete `/admin/migrate-roles` route from `App.tsx`
2. Delete `/pages/admin/MigrateRoles.tsx`
3. Delete `/scripts/migrateUserRoles.ts`
4. Commit your changes

---

## What the Migration Does

1. **Reads** all users from `users` collection
2. **Creates** role documents in `user_roles` collection with:
   - `userId`: User's Firebase Auth ID
   - `role`: User's role (admin, owner, tenant)
   - `assignedAt`: Migration timestamp
   - `assignedBy`: "migration_script"
   - `migratedFrom`: "users_collection"
3. **Removes** the `role` field from `users` collection
4. **Logs** progress and results

---

## Troubleshooting

### Migration Fails with Permission Error
- Ensure you're logged in as admin
- Check Firebase Security Rules are updated
- Verify your admin user has proper permissions

### Some Users Don't Have Roles
- This is normal if users were created without roles
- Manually assign roles using the admin panel
- Or update the user document to include a role

### Migration Runs But No Changes
- Check browser console for errors
- Verify Firebase connection is working
- Try running migration from browser console

---

## Important Notes

⚠️ **Run this migration ONLY ONCE**
⚠️ **Backup your data before migrating**
⚠️ **Test thoroughly after migration**
⚠️ **Delete migration files after successful completion**

---

## Support

If you encounter issues:
1. Check browser console for error messages
2. Review Firebase Console for permission errors
3. Verify all steps were completed in order
4. Check that Security Rules are properly configured
