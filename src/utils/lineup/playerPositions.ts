
import { Lines } from "@/types";

/**
 * Removes a player from their current position in the lineup
 */
export const removePlayerFromCurrentPosition = (playerId: string, lines: Lines) => {
  // Check forwards
  for (let i = 0; i < lines.forwards.length; i++) {
    const line = lines.forwards[i];
    if (line.leftWing?.id === playerId) line.leftWing = null;
    if (line.center?.id === playerId) line.center = null;
    if (line.rightWing?.id === playerId) line.rightWing = null;
  }
  
  // Check defense
  for (let i = 0; i < lines.defense.length; i++) {
    const line = lines.defense[i];
    if (line.leftDefense?.id === playerId) line.leftDefense = null;
    if (line.rightDefense?.id === playerId) line.rightDefense = null;
  }
  
  // Check goalies
  lines.goalies = lines.goalies.filter(g => g.id !== playerId);
  
  // Check special teams
  if (lines.specialTeams) {
    // Check power play
    if (lines.specialTeams.powerPlay) {
      Object.keys(lines.specialTeams.powerPlay).forEach(key => {
        if (lines.specialTeams?.powerPlay?.[key]?.id === playerId) {
          if (lines.specialTeams?.powerPlay) {
            lines.specialTeams.powerPlay[key] = null;
          }
        }
      });
    }
    
    // Check penalty kill
    if (lines.specialTeams.penaltyKill) {
      Object.keys(lines.specialTeams.penaltyKill).forEach(key => {
        if (lines.specialTeams?.penaltyKill?.[key]?.id === playerId) {
          if (lines.specialTeams?.penaltyKill) {
            lines.specialTeams.penaltyKill[key] = null;
          }
        }
      });
    }
  }
};
