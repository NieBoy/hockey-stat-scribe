
import { useState, useEffect } from "react";
import { Team, Lines } from "@/types";
import { buildInitialLines } from "@/utils/lineupUtils";
import { useAvailablePlayers } from "./lineup/useAvailablePlayers";
import { useLineManagement } from "./lineup/useLineManagement";
import { usePlayerMovement } from "./lineup/usePlayerMovement";
import { usePlayerSelection } from "./lineup/usePlayerSelection";

export function useLineupEditor(team: Team) {
  const [lines, setLines] = useState<Lines>(() => {
    console.log("Building initial lines from team data:", team);
    return buildInitialLines(team);
  });
  
  // Update lines when team data changes
  useEffect(() => {
    console.log("Team data changed, rebuilding lines");
    setLines(buildInitialLines(team));
  }, [team]);
  
  const { availablePlayers, setAvailablePlayers, updateAvailablePlayers } = useAvailablePlayers(team, lines);
  const { addForwardLine, addDefenseLine } = useLineManagement(lines, setLines);
  const { handlePlayerMove } = usePlayerMovement(lines, setLines, availablePlayers, setAvailablePlayers);
  const { handlePlayerSelect } = usePlayerSelection(lines, setLines, availablePlayers, setAvailablePlayers);

  // Update available players when lines change
  useEffect(() => {
    updateAvailablePlayers(lines);
  }, [lines, updateAvailablePlayers]);

  return {
    lines,
    setLines,
    availablePlayers,
    setAvailablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    handlePlayerMove
  };
}
