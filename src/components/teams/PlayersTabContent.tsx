
import React from "react";
import { Team } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import PlayerCard from "./PlayerCard";

interface PlayersTabContentProps {
  team: Team;
  handleAddPlayer: (teamId: string) => void;
  handleRemovePlayer: (teamId: string, playerId: string, playerName: string) => void;
}

const PlayersTabContent = ({ team, handleAddPlayer, handleRemovePlayer }: PlayersTabContentProps) => {
  return (
    <>
      {team.players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.players.map(player => (
            <PlayerCard 
              key={player.id} 
              player={player} 
              teamId={team.id}
              onRemovePlayer={handleRemovePlayer} 
            />
          ))}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 pb-6 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No players found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This team doesn't have any players yet.
            </p>
            <Button className="mt-4" onClick={() => handleAddPlayer(team.id)}>
              <Plus className="mr-2 h-4 w-4" /> Add Player
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default PlayersTabContent;
