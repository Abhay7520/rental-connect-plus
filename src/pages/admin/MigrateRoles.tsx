import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { migrateUserRoles } from "@/scripts/migrateUserRoles";

/**
 * TEMPORARY MIGRATION PAGE
 * 
 * This page helps you migrate user roles from the users collection
 * to the new user_roles collection.
 * 
 * IMPORTANT: Run this ONCE, then delete this page!
 */

export default function MigrateRoles() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    migrated: number;
    errors: number;
    total?: number;
  } | null>(null);

  const handleMigration = async () => {
    if (!confirm("This will migrate all user roles to the new user_roles collection. Continue?")) {
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const migrationResult = await migrateUserRoles(true);
      setResult(migrationResult);
    } catch (error) {
      console.error("Migration error:", error);
      alert("Migration failed! Check console for details.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">User Roles Migration</CardTitle>
          <CardDescription>
            Migrate user roles from the users collection to the new user_roles collection
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This migration should only be run ONCE after deploying
              the new Firebase Security Rules. It will move all user roles to the new user_roles
              collection and remove the role field from the users collection.
            </AlertDescription>
          </Alert>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">
                    {result.success ? "Migration Completed Successfully!" : "Migration Completed with Errors"}
                  </p>
                  <p>Successfully migrated: {result.migrated} users</p>
                  <p>Errors: {result.errors}</p>
                  <p>Total processed: {result.total}</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">What this migration does:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Reads all users from the users collection</li>
              <li>Creates role documents in the new user_roles collection</li>
              <li>Removes the role field from the users collection</li>
              <li>Adds migration metadata for audit purposes</li>
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Before running:</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Backup your Firebase database</li>
              <li>Update your Firebase Security Rules</li>
              <li>Ensure you have admin permissions</li>
              <li>Close all other admin tabs</li>
            </ul>
          </div>

          <Button 
            onClick={handleMigration} 
            disabled={isRunning || (result?.success ?? false)}
            size="lg"
            className="w-full"
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isRunning ? "Migrating..." : result?.success ? "Migration Complete" : "Start Migration"}
          </Button>

          {result?.success && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-semibold">Next steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Test login and signup flows</li>
                    <li>Verify role-based permissions</li>
                    <li>Delete this migration page from your project</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
