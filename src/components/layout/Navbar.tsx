
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  CaseSensitive, 
  ClipboardList, 
  User,
  LogOut,
  Home,
  Users,
  CalendarDays
} from "lucide-react";
import { currentUser } from "@/lib/mock-data";

export default function Navbar() {
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
          <Link to="/stats" className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4" />
            Stats
          </Link>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-2 text-sm">
            <span>{currentUser.name}</span>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
              {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
            </span>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profile">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
