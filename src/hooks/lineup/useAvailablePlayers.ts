
import { useState, useCallback, useEffect } from "react";
import { Team, User, Lines } from "@/types";
import { getAvailablePlayers } from "@/utils/lineupUtils";

export function useAvailablePlayers(team: Team, lines: Lines) {
  const [availablePlayers, setAvailablePlayers] = useState<User[]>(() => {
    console.log("Initial available players calculation");
    console.log("Team details:", {
      id: team.id,
      totalPlayers: team.players?.length || 0,
      playerIds: team.players?.map(p => p.id)
    });
    return getAvailablePlayers(team, lines);
  });

  const updateAvailablePlayers = useCallback((newLines: Lines) => {
    console.log("Updating available players");
    console.log("Team details:", {
      id: team.id,
      totalPlayers: team.players?.length || 0,
      playerIds: team.players?.map(p => p.id)
    });
    console.log("Current lines structure:", {
      forwards: newLines.forwards.map(l => ({
        lineNumber: l.lineNumber,
        players: {
          lw: l.leftWing?.id,
          c: l.center?.id,
          rw: l.rightWing?.id
        }
      })),
      defense: newLines.defense.map(l => ({
        lineNumber: l.lineNumber,
        players: {
          ld: l.leftDefense?.id,
          rd: l.rightDefense?.id
        }
      })),
      goalies: newLines.goalies.map(g => g.id)
    });
    
    const newAvailablePlayers = getAvailablePlayers(team, newLines);
    console.log("New available players details:", newAvailablePlayers.map(p => ({
      id: p.id,
      name: p.name,
      position: p.position
    })));
    setAvailablePlayers(newAvailablePlayers);
  }, [team]);

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
