
import { useState, useCallback, useEffect } from "react";
import { Team, User, Lines } from "@/types";
import { getAvailablePlayers } from "@/utils/lineupUtils";

export function useAvailablePlayers(team: Team, lines: Lines) {
  const [availablePlayers, setAvailablePlayers] = useState<User[]>(() => {
    console.log("Initial available players calculation");
    console.log("Team ID:", team.id);
    console.log("Total team players:", team.players?.length || 0);
    return getAvailablePlayers(team, lines);
  });

  const updateAvailablePlayers = useCallback((newLines: Lines) => {
    console.log("Updating available players");
    console.log("Team ID:", team.id);
    console.log("Total team players:", team.players?.length || 0);
    console.log("Current lines structure:", newLines);
    const newAvailablePlayers = getAvailablePlayers(team, lines);
    console.log("New available players count:", newAvailablePlayers.length);
    console.log("New available players:", newAvailablePlayers.map(p => ({ id: p.id, name: p.name })));
    setAvailablePlayers(newAvailablePlayers);
  }, [team, lines]);

  useEffect(() => {
    console.log("Team or lines changed, recalculating available players");
    updateAvailablePlayers(lines);
  }, [team.id, lines, updateAvailablePlayers]);

  return {
    availablePlayers,
    setAvailablePlayers,
    updateAvailablePlayers
  };
}
