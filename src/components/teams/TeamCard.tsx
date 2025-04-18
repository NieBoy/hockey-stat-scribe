
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserCircle, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  onAddPlayer: (teamId: string) => void;
}

export default function TeamCard({ team, onAddPlayer }: TeamCardProps) {
  return (
    <Card key={team.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <Users className="h-4 w-4" />
          <span>{team.players.length} Players</span>
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {team.players.slice(0, 3).map((player) => (
              <div 
                key={player.id} 
                className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-sm"
              >
                <UserCircle className="h-3 w-3" />
                <Link to={`/players/${player.id}`} className="hover:underline">
                  {player.name}
                </Link>
              </div>
            ))}
            {team.players.length > 3 && (
              <div className="bg-muted/50 px-2 py-1 rounded-md text-sm">
                +{team.players.length - 3} more
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-3">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/teams/${team.id}`}>View Details</Link>
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="gap-1" 
            onClick={() => onAddPlayer(team.id)}
          >
            <Plus className="h-4 w-4" /> Add Player
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
