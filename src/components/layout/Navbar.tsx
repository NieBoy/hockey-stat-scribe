
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import Logo from "./navbar/Logo";
import NavLinks from "./navbar/NavLinks";
import UserMenu from "./navbar/UserMenu";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();

  // Always render the navbar, but with different content based on auth status
  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center justify-between py-4">
        <Logo />
        
        {user ? (
          <>
            <NavLinks user={user} />
            <UserMenu user={user} signOut={useAuth().signOut} />
          </>
        ) : (
          <div className="flex items-center ml-auto">
            <Button asChild variant="outline" size="sm">
              <Link to="/signin" className="flex items-center gap-2">
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
