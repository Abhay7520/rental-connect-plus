# 🔒 Firebase Security Rules - Approach B Implementation

## ✅ What Changed?

Your app now uses **separate collections** for user data and roles:
- `users/` - Stores user profiles (name, email, phone, address) **WITHOUT roles**
- `user_roles/` - Stores only roles in a secure collection

This prevents users from manipulating their own roles.

---

## 📋 Step-by-Step Setup

### Step 1: Open Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **rental-connect-plus**
3. Click **Firestore Database** in the left sidebar
4. Click the **Rules** tab

---

### Step 2: Copy & Paste These Security Rules

Replace ALL existing rules with these:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============ HELPER FUNCTIONS ============
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/user_roles/$(request.auth.uid)).data.role == 'owner';
    }
    
    function isOwnerOfProperty(propertyId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/properties/$(propertyId)).data.ownerId == request.auth.uid;
    }
    
    // ============ USER ROLES (SECURITY LAYER) ============
    // This is the SECURE collection - users CANNOT modify their own roles
    
    match /user_roles/{userId} {
      // Anyone can read their own role
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Admins can read all roles
      allow read: if isAdmin();
      
      // ONLY admins can create/update/delete roles
      allow create, update, delete: if isAdmin();
    }
    
    // ============ USERS COLLECTION ============
    // Stores user profiles WITHOUT roles
    
    match /users/{userId} {
      // Users can read their own profile
      allow read: if isAuthenticated() && request.auth.uid == userId;
      
      // Admins can read all profiles
      allow read: if isAdmin();
      
      // Users can create their profile on signup
      allow create: if isAuthenticated() && request.auth.uid == userId;
      
      // Users can update their own profile (name, phone, address)
      allow update: if isAuthenticated() && request.auth.uid == userId;
      
      // Admins can update any profile
      allow update: if isAdmin();
      
      // ONLY admins can delete users
      allow delete: if isAdmin();
    }
    
    // ============ PROPERTIES ============
    
    match /properties/{propertyId} {
      // Everyone can read properties (for browsing)
      allow read: if true;
      
      // Only authenticated users can create properties (for themselves)
      allow create: if isAuthenticated() && 
                    request.resource.data.ownerId == request.auth.uid;
      
      // Only property owner or admin can update
      allow update: if isAuthenticated() && 
                    (resource.data.ownerId == request.auth.uid || isAdmin());
      
      // Only property owner or admin can delete
      allow delete: if isAuthenticated() && 
                    (resource.data.ownerId == request.auth.uid || isAdmin());
    }
    
    // ============ BOOKINGS ============
    
    match /bookings/{bookingId} {
      // Tenants can only see their own bookings
      allow read: if isAuthenticated() && 
                  request.auth.uid == resource.data.tenantId;
      
      // Property owners can see bookings for their properties
      allow read: if isAuthenticated() && 
                  isOwnerOfProperty(resource.data.propertyId);
      
      // Admins can see all bookings
      allow read: if isAdmin();
      
      // Tenants can create bookings (only for themselves)
      allow create: if isAuthenticated() && 
                    request.resource.data.tenantId == request.auth.uid;
      
      // Tenant can update their booking, owner can update booking status
      allow update: if isAuthenticated() && 
                    (request.auth.uid == resource.data.tenantId || 
                     isOwnerOfProperty(resource.data.propertyId) || 
                     isAdmin());
      
      // Only admins can delete bookings
      allow delete: if isAdmin();
    }
    
    // ============ ISSUES ============
    
    match /issues/{issueId} {
      // Tenants can only see their own issues
      allow read: if isAuthenticated() && 
                  request.auth.uid == resource.data.tenantId;
      
      // Property owners can see issues for their properties
      allow read: if isAuthenticated() && 
                  isOwnerOfProperty(resource.data.propertyId);
      
      // Admins can see all issues
      allow read: if isAdmin();
      
      // Tenants can create issues (only for themselves)
      allow create: if isAuthenticated() && 
                    request.resource.data.tenantId == request.auth.uid;
      
      // Tenant or owner can update issues
      allow update: if isAuthenticated() && 
                    (request.auth.uid == resource.data.tenantId || 
                     isOwnerOfProperty(resource.data.propertyId) || 
                     isAdmin());
      
      // Only admins can delete issues
      allow delete: if isAdmin();
    }
    
    // ============ PAYMENTS ============
    
    match /payments/{paymentId} {
      // Tenants can only see their own payments
      allow read: if isAuthenticated() && 
                  request.auth.uid == resource.data.tenantId;
      
      // Property owners can see payments for their properties
      allow read: if isAuthenticated() && 
                  isOwnerOfProperty(resource.data.propertyId);
      
      // Admins can see all payments
      allow read: if isAdmin();
      
      // Only admins or property owners can create payments
      allow create: if isAdmin() || 
                    (isAuthenticated() && isOwnerOfProperty(request.resource.data.propertyId));
      
      // Tenant can mark as paid, owner can update
      allow update: if isAuthenticated() && 
                    (request.auth.uid == resource.data.tenantId || 
                     isOwnerOfProperty(resource.data.propertyId) || 
                     isAdmin());
      
      // Only admins can delete payments
      allow delete: if isAdmin();
    }
    
    // ============ ANNOUNCEMENTS ============
    
    match /announcements/{announcementId} {
      // Everyone can read announcements
      allow read: if true;
      
      // Only owners and admins can create announcements
      allow create: if isOwner() || isAdmin();
      
      // Only the creator or admin can update/delete
      allow update, delete: if isAuthenticated() && 
                            (resource.data.ownerId == request.auth.uid || isAdmin());
    }
    
    // ============ POLLS ============
    
    match /polls/{pollId} {
      // Everyone can read polls
      allow read: if true;
      
      // Authenticated users can create polls
      allow create: if isAuthenticated();
      
      // Only creator or admin can update/delete
      allow update, delete: if isAuthenticated() && 
                            (resource.data.createdBy == request.auth.uid || isAdmin());
    }
    
    // ============ EVENTS ============
    
    match /events/{eventId} {
      // Everyone can read events
      allow read: if true;
      
      // Authenticated users can create events
      allow create: if isAuthenticated();
      
      // Only creator or admin can update/delete
      allow update, delete: if isAuthenticated() && 
                            (resource.data.createdBy == request.auth.uid || isAdmin());
    }
  }
}
```

---

### Step 3: Publish the Rules

1. Click the **Publish** button at the top
2. Wait for confirmation: "Rules published successfully"

---

### Step 4: Migrate Existing Data

**IMPORTANT:** You need to migrate existing user roles from the `users` collection to the new `user_roles` collection.

#### Option A: Manual Migration (Small number of users)

1. Go to **Firestore Database** → **Data** tab
2. For each user in the `users` collection:
   - Note their **Document ID** (user UID) and **role** field
   - Click **Start collection** → Enter `user_roles`
   - Create a document with:
     - **Document ID**: Same as user's UID
     - **Fields**:
       - `userId`: (string) User's UID
       - `role`: (string) "admin", "owner", or "tenant"
       - `assignedAt`: (timestamp) Current date/time
       - `assignedBy`: (string) "system"

#### Option B: Script Migration (Many users)

If you have many users, I can create a migration script to automate this.

---

### Step 5: Test Your Security

1. **Log out** of your application
2. **Log in** again (to refresh auth state)
3. **Test as Tenant:**
   - ✅ Can see own bookings, payments, issues
   - ❌ Cannot see other users' data
   - ❌ Cannot change own role

4. **Test as Owner:**
   - ✅ Can see bookings/issues for own properties
   - ❌ Cannot see other owners' data
   - ❌ Cannot change own role

5. **Test as Admin:**
   - ✅ Can see all data
   - ✅ Can manage user roles
   - ✅ Full system access

---

## 🎯 What's Protected Now?

### ✅ Before (Vulnerable):
- Users could modify their own role in Firestore
- Roles were in the same collection as user profiles
- Any authenticated user could potentially escalate privileges

### ✅ After (Secure):
- Roles are in a separate `user_roles` collection
- **ONLY admins** can modify roles
- Users cannot change their own roles
- Clear audit trail of role assignments

---

## 📊 Data Structure

### users/{userId}
```json
{
  "uid": "abc123",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "createdAt": "2024-01-01T00:00:00Z"
  // NO ROLE FIELD!
}
```

### user_roles/{userId}
```json
{
  "userId": "abc123",
  "role": "tenant",
  "assignedAt": "2024-01-01T00:00:00Z",
  "assignedBy": "admin_user_id"
}
```

---

## 🚨 Security Notes

1. **Never query user_roles from the client** except through AuthContext
2. **Always use helper functions** (`isAdmin()`, `isOwner()`) in rules
3. **Test rules thoroughly** before deploying to production
4. **Monitor Firebase usage** to detect unusual access patterns
5. **Keep rules up-to-date** as you add new features

---

## ❓ Need Help?

If you encounter any issues:
1. Check Firebase Console → Firestore → Rules for any errors
2. Check browser console for permission denied errors
3. Verify you've migrated all existing user roles
4. Make sure you're logged out and back in after publishing rules

---

**Your data is now secure! 🎉**
