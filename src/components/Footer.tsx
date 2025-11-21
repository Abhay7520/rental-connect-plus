import { Home } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-gradient-to-b from-background to-secondary/20 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-primary/10">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                RentEazy
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Simplifying rental and community management for everyone.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">For Tenants</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">Find Properties</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Pay Rent</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Maintenance Requests</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Community Forum</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">For Owners</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">List Properties</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Track Payments</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Manage Tenants</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Analytics</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary transition-colors cursor-pointer">About Us</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Contact</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} RentEazy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
