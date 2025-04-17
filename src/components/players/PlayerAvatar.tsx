
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getUserInitials } from "@/utils/nameUtils";

interface PlayerAvatarProps {
  name: string;
  className?: string;
}

export default function PlayerAvatar({ name, className = "h-16 w-16" }: PlayerAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarFallback className="bg-primary/10 text-primary text-xl">
        {getUserInitials(name || "")}
      </AvatarFallback>
    </Avatar>
  );
}
