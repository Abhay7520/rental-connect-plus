import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Home, LogOut, User, MessageCircle } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              RentEazy
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="hover:bg-primary/10">
              <Link to="/chatbot">
                <MessageCircle className="h-4 w-4 mr-2" />
                Help
              </Link>
            </Button>
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm bg-secondary/50 px-3 py-1.5 rounded-full">
                  <div className="p-1 rounded-full bg-primary/10">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground capitalize font-medium">
                    {user.role}
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button variant="gradient" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
