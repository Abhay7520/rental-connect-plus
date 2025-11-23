import { collection, getDocs, doc, setDoc, updateDoc, deleteField } from "firebase/firestore";
import { db } from "@/firebase/config";

/**
 * Migration Script: Move user roles from users collection to user_roles collection
 * 
 * This script:
 * 1. Reads all users from the users collection
 * 2. Creates corresponding role documents in user_roles collection
 * 3. Optionally removes the role field from users collection
 * 
 * Run this script ONCE after deploying the new security rules
 */

interface User {
  id: string;
  email: string;
  role?: string;
  [key: string]: any;
}

export async function migrateUserRoles(removeRoleFromUsers: boolean = true) {
  console.log("🚀 Starting user roles migration...");
  console.log("━".repeat(50));

  try {
    // Step 1: Get all users from users collection
    console.log("📖 Reading users from 'users' collection...");
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users: User[] = [];
    
    usersSnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });

    console.log(`✅ Found ${users.length} users`);
    console.log("━".repeat(50));

    // Step 2: Filter users with roles
    const usersWithRoles = users.filter(user => user.role);
    console.log(`📊 Users with roles: ${usersWithRoles.length}`);
    
    if (usersWithRoles.length === 0) {
      console.log("⚠️  No users with roles found. Migration not needed.");
      return { success: true, migrated: 0, errors: 0 };
    }

    // Step 3: Migrate each user's role to user_roles collection
    let successCount = 0;
    let errorCount = 0;

    for (const user of usersWithRoles) {
      try {
        console.log(`\n🔄 Migrating user: ${user.email} (${user.id})`);
        console.log(`   Role: ${user.role}`);

        // Create role document in user_roles collection
        const roleData = {
          userId: user.id,
          role: user.role,
          assignedAt: new Date().toISOString(),
          assignedBy: "migration_script",
          migratedFrom: "users_collection"
        };

        const roleRef = doc(db, "user_roles", user.id);
        await setDoc(roleRef, roleData);
        console.log(`   ✅ Created role document in user_roles`);

        // Optionally remove role field from users collection
        if (removeRoleFromUsers) {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, {
            role: deleteField()
          });
          console.log(`   ✅ Removed role field from users collection`);
        }

        successCount++;
      } catch (error) {
        console.error(`   ❌ Error migrating user ${user.email}:`, error);
        errorCount++;
      }
    }

    // Step 4: Summary
    console.log("\n" + "━".repeat(50));
    console.log("📊 MIGRATION SUMMARY");
    console.log("━".repeat(50));
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total users processed: ${usersWithRoles.length}`);
    console.log("━".repeat(50));

    if (successCount === usersWithRoles.length) {
      console.log("🎉 Migration completed successfully!");
    } else {
      console.log("⚠️  Migration completed with some errors. Please review logs.");
    }

    return { 
      success: errorCount === 0, 
      migrated: successCount, 
      errors: errorCount,
      total: usersWithRoles.length
    };

  } catch (error) {
    console.error("❌ Fatal error during migration:", error);
    throw error;
  }
}

// Standalone execution function
export async function runMigration() {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║          USER ROLES MIGRATION SCRIPT                      ║
║                                                           ║
║  This will move user roles from 'users' collection       ║
║  to the new 'user_roles' collection                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  try {
    // Run migration and remove role field from users
    const result = await migrateUserRoles(true);
    
    if (result.success) {
      console.log("\n✨ All done! Your security is now improved.");
      console.log("\n📝 Next steps:");
      console.log("   1. Update Firebase Security Rules in the console");
      console.log("   2. Test login/signup flows");
      console.log("   3. Verify role-based permissions work correctly");
    }
  } catch (error) {
    console.error("\n💥 Migration failed:", error);
    console.log("\n🔧 Troubleshooting:");
    console.log("   - Check Firebase connection");
    console.log("   - Verify you have write permissions");
    console.log("   - Review error logs above");
  }
}

// Note: This script is designed to be run from the admin UI (/admin/migrate-roles)
// It should not be auto-executed on import
