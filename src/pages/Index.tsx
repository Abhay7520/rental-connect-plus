import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Home, Shield, Zap, Users, Building2, DollarSign } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Shield,
      title: "Secure & Trusted",
      description: "Bank-level security for all your rental transactions and data",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant updates, real-time notifications, and quick responses",
    },
    {
      icon: Users,
      title: "Community First",
      description: "Build stronger communities with integrated social features",
    },
  ];

  const roles = [
    {
      icon: Home,
      title: "For Tenants",
      description: "Find your perfect home, pay rent online, and connect with your community",
      link: "/signup",
    },
    {
      icon: Building2,
      title: "For Owners",
      description: "List properties, manage tenants, and track payments effortlessly",
      link: "/signup",
    },
    {
      icon: DollarSign,
      title: "For Admins",
      description: "Comprehensive platform management and analytics at your fingertips",
      link: "/signup",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-secondary/30 via-background to-background">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-6">
            <Home className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            RentEazy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Simplify rental management. Empower communities. Transform living.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg">
              <Link to="/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose RentEazy?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage rentals and build thriving communities
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built For Everyone</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're renting, owning, or managing - we've got you covered
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {roles.map((role) => (
              <Card key={role.title} className="hover:shadow-elegant transition-shadow">
                <CardHeader>
                  <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                    <role.icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription className="text-base mb-4">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={role.link}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Rental Experience?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who trust RentEazy for their rental management needs
          </p>
          <Button size="lg" asChild className="text-lg">
            <Link to="/signup">Start Your Journey Today</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
