
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  CaseSensitive, 
  Home,
  Users,
  CalendarDays,
  Building,
  Mail,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const hasMultipleRoles = Array.isArray(user.role) && user.role.length > 1;

  return (
    <nav className="border-b bg-background">
      <div className="container flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <CaseSensitive className="h-8 w-8 text-primary" />
          <Link to="/" className="text-xl font-bold">
            Hockey Stat Scribe
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/" className="flex items-center gap-2 text-sm font-medium">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <Link to="/games" className="flex items-center gap-2 text-sm font-medium">
            <CalendarDays className="h-4 w-4" />
            Games
          </Link>
          <Link to="/teams" className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4" />
            Teams
          </Link>
          {user.isAdmin && (
            <Link to="/organizations" className="flex items-center gap-2 text-sm font-medium">
              <Building className="h-4 w-4" />
              Organizations
            </Link>
          )}
          <Link to="/stats" className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4" />
            Stats
          </Link>
          <Link to="/invitations" className="flex items-center gap-2 text-sm font-medium">
            <Mail className="h-4 w-4" />
            Invitations
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 text-sm">
            <span>{user.name}</span>
            {user.role && user.role.length > 0 && (
              <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                {hasMultipleRoles 
                  ? `${user.role[0].charAt(0).toUpperCase() + user.role[0].slice(1)}${user.isAdmin ? '+' : ''}` 
                  : user.role[0].charAt(0).toUpperCase() + user.role[0].slice(1)}
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {getUserInitials(user.name || 'U')}
                </AvatarFallback>
              </Avatar>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => signOut()}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
