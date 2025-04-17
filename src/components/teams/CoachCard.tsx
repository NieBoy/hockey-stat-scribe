
import React from "react";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface CoachCardProps {
  coach: User;
}

const CoachCard = ({ coach }: CoachCardProps) => {
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card key={coach.id}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {getUserInitials(coach.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base font-medium">
              <Link 
                to={`/players/${coach.id}`} 
                className="hover:underline"
              >
                {coach.name}
              </Link>
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {coach.email && (
          <div className="text-sm text-muted-foreground mb-2">
            {coach.email}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CoachCard;
