import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface UserWithRole {
  uid: string;
  email: string;
  name: string;
  hasRole: boolean;
  currentRole?: string;
  selectedRole: string;
}

export default function MigrateRoles() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      
      // Fetch all users from Firestore
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));

      // Check which users have roles in user_roles collection
      const usersWithRoleStatus = await Promise.all(
        usersData.map(async (user: any) => {
          const roleDoc = await getDoc(doc(db, "user_roles", user.uid));
          const hasRole = roleDoc.exists();
          
          return {
            uid: user.uid,
            email: user.email || "No email",
            name: user.name || "No name",
            hasRole,
            currentRole: hasRole ? roleDoc.data()?.role : undefined,
            selectedRole: hasRole ? roleDoc.data()?.role : "tenant"
          };
        })
      );

      setUsers(usersWithRoleStatus);
      console.log(`✅ Found ${usersWithRoleStatus.length} users, ${usersWithRoleStatus.filter(u => !u.hasRole).length} without roles`);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (uid: string, role: string) => {
    setUsers(users.map(user => 
      user.uid === uid ? { ...user, selectedRole: role } : user
    ));
  };

  const migrateAllRoles = async () => {
    try {
      setMigrating(true);
      
      const usersWithoutRoles = users.filter(u => !u.hasRole);
      
      if (usersWithoutRoles.length === 0) {
        toast({
          title: "All set!",
          description: "All users already have roles assigned.",
        });
        return;
      }

      // Create role documents for all users without roles
      await Promise.all(
        usersWithoutRoles.map(user =>
          setDoc(doc(db, "user_roles", user.uid), {
            userId: user.uid,
            role: user.selectedRole,
            assignedAt: new Date().toISOString(),
            assignedBy: "migration_tool"
          })
        )
      );

      toast({
        title: "Success!",
        description: `Assigned roles to ${usersWithoutRoles.length} users. You can now log in!`,
      });

      // Refresh the list
      await fetchUsersAndRoles();
    } catch (error: any) {
      console.error("Migration error:", error);
      toast({
        title: "Error",
        description: "Failed to migrate roles: " + error.message,
        variant: "destructive"
      });
    } finally {
      setMigrating(false);
    }
  };

  const usersWithoutRoles = users.filter(u => !u.hasRole);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Fix User Roles</CardTitle>
            <CardDescription>
              Assign roles to users who are missing them
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {usersWithoutRoles.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-medium">All users have roles!</p>
                <p className="text-muted-foreground">Everyone can log in now.</p>
              </div>
            ) : (
              <>
                <div className="rounded-lg border p-4 bg-amber-50 border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <p className="font-medium text-amber-900">
                      {usersWithoutRoles.length} user(s) cannot log in
                    </p>
                  </div>
                  <p className="text-sm text-amber-700">
                    These users are missing roles. Select a role for each, then click "Assign All Roles"
                  </p>
                </div>

                <div className="space-y-4">
                  {users.map(user => (
                    <div 
                      key={user.uid} 
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        user.hasRole ? 'bg-green-50 border-green-200' : 'bg-background'
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">UID: {user.uid}</p>
                      </div>
                      
                      {user.hasRole ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium capitalize text-green-700">
                            {user.currentRole}
                          </span>
                        </div>
                      ) : (
                        <Select
                          value={user.selectedRole}
                          onValueChange={(value) => handleRoleChange(user.uid, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tenant">Tenant</SelectItem>
                            <SelectItem value="owner">Owner</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  ))}
                </div>

                <Button 
                  onClick={migrateAllRoles} 
                  disabled={migrating || usersWithoutRoles.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {migrating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning roles...
                    </>
                  ) : (
                    `Assign All Roles (${usersWithoutRoles.length} users)`
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
