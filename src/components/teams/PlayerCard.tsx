
import React from "react";
import { User } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, UserCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface PlayerCardProps {
  player: User;
  teamId: string;
  onRemovePlayer: (teamId: string, playerId: string, playerName: string) => void;
}

const PlayerCard = ({ player, teamId, onRemovePlayer }: PlayerCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <UserCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="min-w-0">
              <Link 
                to={`/players/${player.id}`} 
                className="font-medium text-sm hover:underline truncate block"
              >
                {player.name}
              </Link>
              {(player.position || player.number) && (
                <div className="text-xs text-muted-foreground truncate">
                  {player.position}
                  {player.position && player.number && " • "}
                  {player.number && `#${player.number}`}
                </div>
              )}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0 text-destructive flex-shrink-0"
            onClick={() => onRemovePlayer(teamId, player.id, player.name)}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove player</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PlayerCard;
