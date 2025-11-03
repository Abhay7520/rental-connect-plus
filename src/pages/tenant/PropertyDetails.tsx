import { useParams, useNavigate } from "react-router-dom";
import { useProperty } from "@/contexts/PropertyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, DollarSign, ArrowLeft } from "lucide-react";

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPropertyById } = useProperty();
  const property = id ? getPropertyById(id) : undefined;

  if (!property) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
              <p className="text-muted-foreground mb-6">This property may have been removed</p>
              <Button onClick={() => navigate("/tenant/browse")}>Browse Properties</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-secondary/20 to-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Button
            variant="ghost"
            onClick={() => navigate("/tenant/browse")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Browse
          </Button>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-96 bg-secondary rounded-lg overflow-hidden">
                {property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Building2 className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>

              {property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {property.images.slice(1, 5).map((img, idx) => (
                    <div key={idx} className="h-24 bg-secondary rounded-lg overflow-hidden">
                      <img src={img} alt={`${property.title} ${idx + 2}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}

              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">Description</h2>
                  <p className="text-muted-foreground">
                    {property.description || "No description available for this property."}
                  </p>
                </CardContent>
              </Card>

              {property.amenities.length > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, idx) => (
                        <Badge key={idx} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardContent className="pt-6 space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{property.title}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4" />
                      {property.location}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-3xl font-bold text-primary">
                    <DollarSign className="h-8 w-8" />
                    ${property.rent_price}
                    <span className="text-base font-normal text-muted-foreground">/month</span>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => navigate(`/tenant/book/${property.id}`)}
                  >
                    Book Now
                  </Button>

                  <div className="pt-4 border-t text-sm text-muted-foreground">
                    <p>• Available for immediate move-in</p>
                    <p>• Security deposit required</p>
                    <p>• Pet policy varies by property</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PropertyDetails;
