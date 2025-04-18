
import { useState } from "react";
import { Team, User, Lines } from "@/types";
import { getAvailablePlayers } from "@/utils/lineupUtils";

export function useAvailablePlayers(team: Team, lines: Lines) {
  const [availablePlayers, setAvailablePlayers] = useState<User[]>(
    getAvailablePlayers(team, lines)
  );

  const updateAvailablePlayers = (newLines: Lines) => {
    setAvailablePlayers(getAvailablePlayers(team, newLines));
  };

  return {
    availablePlayers,
    setAvailablePlayers,
    updateAvailablePlayers
  };
}
