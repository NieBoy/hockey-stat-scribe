
import { Lines, User, Position } from "@/types";
import { removePlayerFromCurrentPosition } from "@/utils/lineupUtils";

interface PlayerMoveParams {
  playerId: string;
  sourceId: string;
  destinationId: string;
}

export function usePlayerMovement(
  lines: Lines,
  setLines: (lines: Lines) => void,
  availablePlayers: User[],
  setAvailablePlayers: (players: User[]) => void
) {
  const handlePlayerMove = ({
    playerId,
    sourceId,
    destinationId,
  }: PlayerMoveParams) => {
    console.log("Handle player move:", {
      playerId,
      sourceId,
      destinationId
    });
    
    // Find the player
    let player: User | null = null;
    let newAvailablePlayers = [...availablePlayers];
    
    // Check if player is in available players
    if (sourceId === 'roster' || sourceId.startsWith('roster')) {
      player = availablePlayers.find(p => p.id === playerId) || null;
      if (player) {
        newAvailablePlayers = availablePlayers.filter(p => p.id !== playerId);
      }
    } else {
      // Find player in lines
      const newLines = { ...lines };
      
      // Check forwards
      for (const line of newLines.forwards) {
        if (line.leftWing?.id === playerId) {
          player = line.leftWing;
        } else if (line.center?.id === playerId) {
          player = line.center;
        } else if (line.rightWing?.id === playerId) {
          player = line.rightWing;
        }
        if (player) break;
      }
      
      // Check defense
      if (!player) {
        for (const line of newLines.defense) {
          if (line.leftDefense?.id === playerId) {
            player = line.leftDefense;
          } else if (line.rightDefense?.id === playerId) {
            player = line.rightDefense;
          }
          if (player) break;
        }
      }
      
      // Check goalies
      if (!player) {
        player = newLines.goalies.find(g => g.id === playerId) || null;
      }
      
      // Remove player from current position
      if (player) {
        removePlayerFromCurrentPosition(playerId, newLines);
        setLines(newLines);
      }
    }
    
    if (!player) {
      console.error("Player not found:", playerId);
      return;
    }

    // Handle returning player to roster
    if (destinationId === 'roster') {
      console.log("Moving player back to roster");
      setAvailablePlayers([...newAvailablePlayers, player]);
      return;
    }

    // Parse destination ID format: type-number-position
    // Examples: forward-1-LW, defense-2-RD, goalie-G
    const destParts = destinationId.split('-');
    
    // If this is a special teams position, it will have more parts
    // Example: pp-1-LW or pk-2-RD
    if (destParts[0] === 'pp' || destParts[0] === 'pk') {
      console.log("Special teams not fully implemented yet");
      return;
    }

    // Handle goalie drops
    if (destParts[0] === 'goalie') {
      const newLines = { ...lines };
      if (!newLines.goalies.some(g => g.id === player?.id) && player) {
        newLines.goalies.push({...player, position: 'G'});
        setLines(newLines);
      }
      return;
    }

    // Handle forward and defense line drops
    if (destParts[0] === 'forward' || destParts[0] === 'defense') {
      const lineType = destParts[0];
      const lineNumber = parseInt(destParts[1], 10);
      const position = destParts[2] as Position;
      
      const newLines = { ...lines };
      const lineIndex = lineNumber - 1;
      
      if (lineType === 'forward') {
        const line = newLines.forwards[lineIndex];
        if (line) {
          if (position === 'LW') line.leftWing = {...player, position: 'LW'};
          else if (position === 'C') line.center = {...player, position: 'C'};
          else if (position === 'RW') line.rightWing = {...player, position: 'RW'};
        }
      } else if (lineType === 'defense') {
        const line = newLines.defense[lineIndex];
        if (line) {
          if (position === 'LD') line.leftDefense = {...player, position: 'LD'};
          else if (position === 'RD') line.rightDefense = {...player, position: 'RD'};
        }
      }
      
      setLines(newLines);
      setAvailablePlayers(newAvailablePlayers);
    }
  };

  return {
    handlePlayerMove
  };
}
