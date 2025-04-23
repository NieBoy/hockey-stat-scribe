
import { Link } from "react-router-dom";
import { 
  Home,
  CalendarDays,
  Users,
  Building,
  BarChart3,
  Mail,
  Trophy,
  Activity
} from "lucide-react";
import { User } from "@/types";

interface NavLinksProps {
  user: User;
}

export default function NavLinks({ user }: NavLinksProps) {
  return (
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
      {(user.isAdmin || user.role?.includes('admin')) && (
        <Link to="/organizations" className="flex items-center gap-2 text-sm font-medium">
          <Building className="h-4 w-4" />
          Organizations
        </Link>
      )}
      <Link to="/stats" className="flex items-center gap-2 text-sm font-medium">
        <BarChart3 className="h-4 w-4" />
        Stats
      </Link>
      <Link to="/stars" className="flex items-center gap-2 text-sm font-medium">
        <Trophy className="h-4 w-4" />
        Stars
      </Link>
      <Link to="/invitations" className="flex items-center gap-2 text-sm font-medium">
        <Mail className="h-4 w-4" />
        Invitations
      </Link>
    </div>
  );
}
