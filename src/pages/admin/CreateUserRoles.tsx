import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserRolesService } from "@/services/firebaseService";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";

const CreateUserRoles = () => {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"tenant" | "owner" | "admin">("tenant");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateRole = async () => {
    if (!userId) {
      toast({
        title: "Missing User ID",
        description: "Please enter a user ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("🔵 Creating role for user:", userId, role);
      await UserRolesService.create(userId, role);
      
      toast({
        title: "Success!",
        description: `Role '${role}' created for user ${userId}`,
      });
      
      setUserId("");
      setRole("tenant");
    } catch (error: any) {
      console.error("❌ Error creating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-4xl">
          <BackButton />
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Create User Role</CardTitle>
              <CardDescription>
                Manually create a role for an existing user. Use this to fix "User role not found" errors.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID (UID from Firebase Auth)</Label>
                <Input
                  id="userId"
                  placeholder="Enter Firebase Auth UID"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  Find the UID in Firebase Console → Authentication → Users
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(value: any) => setRole(value)} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">Tenant</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleCreateRole} disabled={loading} className="w-full">
                {loading ? "Creating..." : "Create Role"}
              </Button>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Quick Guide:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Go to Firebase Console → Authentication → Users</li>
                  <li>Find your user and copy their UID</li>
                  <li>Paste the UID above and select the role</li>
                  <li>Click "Create Role" and try logging in again</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateUserRoles;
