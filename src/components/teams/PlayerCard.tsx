
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
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <Link 
                to={`/players/${player.id}`} 
                className="font-medium text-sm hover:underline truncate"
              >
                {player.name}
              </Link>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {player.position && <span>{player.position}</span>}
                {player.number && (
                  <>
                    {player.position && <span>•</span>}
                    <span>#{player.number}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0 text-destructive"
            onClick={() => onRemovePlayer(teamId, player.id, player.name)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove player</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default PlayerCard;
