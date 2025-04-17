
import { Link } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserType } from "@/types";

interface UserMenuProps {
  user: UserType;
  signOut: () => void;
}

export default function UserMenu({ user, signOut }: UserMenuProps) {
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const hasMultipleRoles = Array.isArray(user.role) && user.role.length > 1;

  return (
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
  );
}
