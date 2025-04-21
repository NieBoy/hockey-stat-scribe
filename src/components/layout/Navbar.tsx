
import { useAuth } from "@/hooks/useAuth";
import Logo from "./navbar/Logo";
import NavLinks from "./navbar/NavLinks";
import UserMenu from "./navbar/UserMenu";

export default function Navbar() {
  const { user, signOut } = useAuth();

  // If there's no user (not authenticated), don't render the navbar
  if (!user) return null;

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center justify-between py-4">
        <Logo />
        <NavLinks user={user} />
        <UserMenu user={user} signOut={signOut} />
      </div>
    </nav>
  );
}
