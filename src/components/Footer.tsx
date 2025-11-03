import { Home } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-primary">RentEazy</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Simplifying rental and community management for everyone.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">For Tenants</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Find Properties</li>
              <li>Pay Rent</li>
              <li>Maintenance Requests</li>
              <li>Community Forum</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">For Owners</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>List Properties</li>
              <li>Track Payments</li>
              <li>Manage Tenants</li>
              <li>Analytics</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>About Us</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
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
