
import { useState, useEffect, useCallback, useRef } from "react";
import { Team, Lines } from "@/types";
import { buildInitialLines } from "@/utils/lineupUtils";
import { useAvailablePlayers } from "./lineup/useAvailablePlayers";
import { useLineManagement } from "./lineup/useLineManagement";
import { usePlayerMovement } from "./lineup/usePlayerMovement";
import { usePlayerSelection } from "./lineup/usePlayerSelection";
import { getTeamLineup } from "@/services/teams/lineupManagement";

export function useLineupEditor(team: Team) {
  console.log("useLineupEditor initializing with team:", team?.id);
  
  const [lines, setLines] = useState<Lines>(() => {
    console.log("Building initial lines from team data:", team);
    return buildInitialLines(team);
  });
  
  // Track if initial data has been loaded
  const initialLoadComplete = useRef(false);
  // Use a ref to track if fetch is in progress
  const fetchInProgress = useRef(false);
  
  // Force rebuild lines whenever team data changes, including when team players' positions change
  useEffect(() => {
    if (!team?.id || fetchInProgress.current) return;
    
    console.log("Team data changed, rebuilding lines");
    
    const fetchAndBuildLines = async () => {
      try {
        fetchInProgress.current = true;
        
        // Immediately build initial lines from current team data
        const initialLines = buildInitialLines(team);
        setLines(initialLines);
        
        console.log("Fetching latest lineup data for team:", team.id);
        const lineupData = await getTeamLineup(team.id);
        
        if (lineupData && lineupData.length > 0) {
          console.log("Got latest lineup data from database:", lineupData);
          
          // Apply positions from database to the team players
          const updatedTeam = {
            ...team,
            players: team.players.map(player => {
              // Find this player in the lineup data
              const lineupPlayer = lineupData.find(lp => lp.user_id === player.id);
              if (lineupPlayer && lineupPlayer.position) {
                console.log(`Applying position ${lineupPlayer.position} to player ${player.name}`);
                return {
                  ...player,
                  position: lineupPlayer.position,
                  lineNumber: lineupPlayer.line_number
                };
              }
              return player;
            })
          };
          
          // Rebuild lines with the updated team data
          console.log("Rebuilding lines with fresh lineup data");
          const refreshedLines = buildInitialLines(updatedTeam);
          console.log("Refreshed lines:", refreshedLines);
          setLines(refreshedLines);
          initialLoadComplete.current = true;
        } else {
          console.log("No lineup data found in database, using initial lines");
          initialLoadComplete.current = true;
        }
      } catch (error) {
        console.error("Error fetching lineup data:", error);
        initialLoadComplete.current = true;
      } finally {
        fetchInProgress.current = false;
      }
    };
    
    fetchAndBuildLines();
  }, [team?.id, JSON.stringify(team?.players)]);
  
  const { availablePlayers, setAvailablePlayers, updateAvailablePlayers } = useAvailablePlayers(team, lines);
  const { addForwardLine, addDefenseLine } = useLineManagement(lines, setLines);
  const { handlePlayerMove } = usePlayerMovement(lines, setLines, availablePlayers, setAvailablePlayers);
  const { handlePlayerSelect } = usePlayerSelection(lines, setLines, availablePlayers, setAvailablePlayers);

  // Update available players when lines change
  const updateAvailable = useCallback(() => {
    updateAvailablePlayers(lines);
  }, [lines, updateAvailablePlayers]);

  useEffect(() => {
    updateAvailable();
  }, [lines, updateAvailable]);

  return {
    lines,
    setLines,
    availablePlayers,
    setAvailablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    handlePlayerMove,
    isInitialLoadComplete: initialLoadComplete.current
  };
}
