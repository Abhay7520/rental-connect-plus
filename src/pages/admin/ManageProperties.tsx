import { useState } from "react";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";

const ManageProperties = () => {
  const { properties, updateProperty, deleteProperty } = useProperty();
  const { toast } = useToast();
  const [localProperties, setLocalProperties] = useState(properties);

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updateProperty(id, { status: newStatus });
    setLocalProperties(prev => 
      prev.map(p => p.id === id ? { ...p, status: newStatus } : p)
    );
    toast({
      title: "Success",
      description: `Property ${newStatus === "active" ? "activated" : "deactivated"} successfully`,
    });
  };

  const handleDeleteProperty = (id: string) => {
    deleteProperty(id);
    setLocalProperties(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Success",
      description: "Property deleted successfully",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Manage Properties</h1>
          <p className="text-muted-foreground">View and manage all listed properties</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Properties ({localProperties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Listed Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No properties found
                    </TableCell>
                  </TableRow>
                ) : (
                  localProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.title}</TableCell>
                      <TableCell>{property.location}</TableCell>
                      <TableCell>₹{property.rent_price.toLocaleString()}/mo</TableCell>
                      <TableCell>
                        <Badge variant={property.status === "active" ? "default" : "secondary"}>
                          {property.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(property.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleStatus(property.id, property.status)}
                          >
                            {property.status === "active" ? (
                              <ToggleRight className="h-4 w-4" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Property</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{property.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProperty(property.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ManageProperties;
