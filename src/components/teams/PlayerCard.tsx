
import React from "react";
import { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, LineChart } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface PlayerCardProps {
  player: User;
  teamId: string;
  onRemovePlayer: (teamId: string, playerId: string, playerName: string) => void;
}

const PlayerCard = ({ player, teamId, onRemovePlayer }: PlayerCardProps) => {
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card key={player.id}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {getUserInitials(player.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base font-medium">
                <Link 
                  to={`/players/${player.id}`} 
                  className="hover:underline"
                >
                  {player.name}
                </Link>
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {player.number && <span>#{player.number}</span>}
                {player.position && (
                  <>
                    {player.number && <span>•</span>}
                    <span>{player.position}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-red-500 hover:text-red-700 hover:bg-red-100"
            onClick={() => onRemovePlayer(teamId, player.id, player.name)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove player</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {player.email && (
          <div className="text-sm text-muted-foreground mb-2">
            {player.email}
          </div>
        )}
        <div className="flex mt-2 gap-2">
          <Button variant="outline" size="sm" className="gap-1" asChild>
            <Link to={`/players/${player.id}/stats`}>
              <LineChart className="h-3 w-3" /> Stats
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerCard;
