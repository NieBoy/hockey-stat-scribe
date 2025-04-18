
import { useState, useCallback, useEffect } from "react";
import { Team, User, Lines } from "@/types";
import { getAvailablePlayers } from "@/utils/lineupUtils";

export function useAvailablePlayers(team: Team, lines: Lines) {
  const [availablePlayers, setAvailablePlayers] = useState<User[]>(() => 
    getAvailablePlayers(team, lines)
  );

  const updateAvailablePlayers = useCallback((newLines: Lines) => {
    setAvailablePlayers(getAvailablePlayers(team, newLines));
  }, [team]);

  // Initial update of available players
  useEffect(() => {
    updateAvailablePlayers(lines);
  }, [team.id]); // Only run this when team ID changes, not every time lines change

  return {
    availablePlayers,
    setAvailablePlayers,
    updateAvailablePlayers
  };
}
