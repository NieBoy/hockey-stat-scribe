
import React from "react";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CoachCardProps {
  coach: User;
}

const CoachCard = ({ coach }: CoachCardProps) => {
  return (
    <Card>
      <CardContent className="p-2">
        <div className="flex items-center gap-2 min-w-0">
          <UserCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="min-w-0">
            <Link 
              to={`/players/${coach.id}`} 
              className="font-medium text-sm hover:underline truncate block"
            >
              {coach.name}
            </Link>
            {coach.email && (
              <div className="text-xs text-muted-foreground truncate">
                {coach.email}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CoachCard;
