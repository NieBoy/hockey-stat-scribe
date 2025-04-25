
import { useState, useCallback, useEffect } from "react";
import { Team, User, Lines } from "@/types";
import { getAvailablePlayers } from "@/utils/lineupUtils";

export function useAvailablePlayers(team: Team, lines: Lines) {
  const [availablePlayers, setAvailablePlayers] = useState<User[]>(() => 
    getAvailablePlayers(team, lines)
  );

  const updateAvailablePlayers = useCallback((newLines: Lines) => {
    console.log("Updating available players for team:", team.id);
    console.log("Total team players:", team.players.length);
    setAvailablePlayers(getAvailablePlayers(team, newLines));
  }, [team]);

  // Update available players when lines or team changes
  useEffect(() => {
    console.log("Team or lines changed, updating available players");
    updateAvailablePlayers(lines);
  }, [team.id, lines, updateAvailablePlayers]);

  return {
    availablePlayers,
    setAvailablePlayers,
    updateAvailablePlayers
  };
}
