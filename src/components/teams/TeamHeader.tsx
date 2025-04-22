
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PanelLeftClose, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Team } from "@/types";
import DeleteTeamDialog from "./DeleteTeamDialog";

interface TeamHeaderProps {
  team: Team;
  onBackClick: () => void;
  onAddPlayerClick: (teamId: string) => void;
}

const TeamHeader = ({ team, onBackClick, onAddPlayerClick }: TeamHeaderProps) => {
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2" 
        onClick={onBackClick}
      >
        <ArrowLeft className="h-4 w-4" /> Back to Teams
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            {team.players.length} players • {team.coaches.length} coaches
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DeleteTeamDialog teamId={team.id} teamName={team.name} />
          <Button variant="outline" className="gap-2" asChild>
            <Link to={`/teams/${team.id}/lineup`}>
              <PanelLeftClose className="h-4 w-4" />
              Lineup Editor
            </Link>
          </Button>
          <Button className="gap-2" onClick={() => onAddPlayerClick(team.id)}>
            <Plus className="h-4 w-4" />
            Add Player
          </Button>
        </div>
      </div>
    </>
  );
};

export default TeamHeader;
