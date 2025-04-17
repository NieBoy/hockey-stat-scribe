
import React from "react";
import { Team } from "@/types";
import TeamCard from "./TeamCard";

interface TeamsGridProps {
  teams: Team[];
  onAddPlayer: (teamId: string) => void;
}

export default function TeamsGrid({ teams, onAddPlayer }: TeamsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teams.map((team) => (
        <TeamCard 
          key={team.id} 
          team={team} 
          onAddPlayer={onAddPlayer} 
        />
      ))}
    </div>
  );
}
