import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackButton from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, MapPin, DollarSign, Edit, Trash2, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ManageProperties = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOwnerProperties, deleteProperty, updateProperty } = useProperty();
  const { toast } = useToast();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const properties = user ? getOwnerProperties(user.uid) : [];

  const handleDelete = () => {
    if (deleteId) {
      deleteProperty(deleteId);
      toast({
        title: "Property deleted",
        description: "The property has been removed from your listings",
      });
      setDeleteId(null);
    }
  };

  const toggleStatus = (id: string, currentStatus: "active" | "inactive") => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    updateProperty(id, { status: newStatus });
    toast({
      title: "Status updated",
      description: `Property is now ${newStatus}`,
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8">
          <BackButton />
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Manage Properties</h1>
              <p className="text-muted-foreground">View and manage all your listings</p>
            </div>
            <Button onClick={() => navigate("/owner/add-property")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>

          {properties.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Building2 className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No properties yet</h3>
                <p className="text-muted-foreground mb-6">Start by adding your first property</p>
                <Button onClick={() => navigate("/owner/add-property")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="h-48 bg-secondary relative">
                    {property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Building2 className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                    <Badge
                      className="absolute top-3 right-3"
                      variant={property.status === "active" ? "default" : "secondary"}
                    >
                      {property.status}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {property.location}
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <DollarSign className="h-4 w-4" />
                        ${property.rent_price}/month
                      </div>
                    </div>

                    {property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {property.amenities.slice(0, 3).map((amenity, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                        {property.amenities.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{property.amenities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toggleStatus(property.id, property.status)}
                      >
                        <Edit className="mr-2 h-3 w-3" />
                        {property.status === "active" ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(property.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageProperties;
