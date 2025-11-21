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
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.1),transparent_50%)]" />
        
        <div className="container mx-auto text-center max-w-4xl relative animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-8 animate-scale-in shadow-glow">
            <Home className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight animate-slide-up">
            RentEazy
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Simplify rental management. Empower communities. Transform living.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button size="lg" variant="gradient" asChild className="text-lg">
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
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="border-2 hover:border-primary/50 hover-lift hover:shadow-elegant group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background via-secondary/10 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built For Everyone</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether you're renting, owning, or managing - we've got you covered
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {roles.map((role, index) => (
              <Card 
                key={role.title} 
                className="hover-lift hover:shadow-elegant group border-2 hover:border-accent/30"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                    <role.icon className="h-7 w-7 text-accent" />
                  </div>
                  <CardTitle className="text-lg">{role.title}</CardTitle>
                  <CardDescription className="text-base mb-4 leading-relaxed">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full group-hover:bg-accent/5 group-hover:border-accent/50" asChild>
                    <Link to={role.link}>Learn More</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5" />
        <div className="container mx-auto text-center max-w-3xl relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            Ready to Transform Your Rental Experience?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of users who trust RentEazy for their rental management needs
          </p>
          <Button size="lg" variant="gradient" asChild className="text-lg shadow-glow">
            <Link to="/signup">Start Your Journey Today</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
