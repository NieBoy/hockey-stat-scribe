
import { Lines } from "@/types";

interface LineupUpdate {
  team_id: string;
  id: string; // Changed from user_id to id since we're updating team_members table using id
  role: string;
  position: string;
  line_number: number;
}

export const prepareUpdates = (teamId: string, lines: Lines): LineupUpdate[] => {
  const updates: LineupUpdate[] = [];
  
  // Update forward lines
  lines.forwards.forEach(line => {
    if (line.leftWing) {
      updates.push({
        team_id: teamId,
        id: line.leftWing.id,
        role: 'player',
        position: 'LW',
        line_number: line.lineNumber
      });
    }
    
    if (line.center) {
      updates.push({
        team_id: teamId,
        id: line.center.id,
        role: 'player',
        position: 'C',
        line_number: line.lineNumber
      });
    }
    
    if (line.rightWing) {
      updates.push({
        team_id: teamId,
        id: line.rightWing.id,
        role: 'player',
        position: 'RW',
        line_number: line.lineNumber
      });
    }
  });
  
  // Update defense lines
  lines.defense.forEach(line => {
    if (line.leftDefense) {
      updates.push({
        team_id: teamId,
        id: line.leftDefense.id,
        role: 'player',
        position: 'LD',
        line_number: line.lineNumber
      });
    }
    
    if (line.rightDefense) {
      updates.push({
        team_id: teamId,
        id: line.rightDefense.id,
        role: 'player',
        position: 'RD',
        line_number: line.lineNumber
      });
    }
  });
  
  // Update goalies
  lines.goalies.forEach((goalie, index) => {
    if (goalie) {
      updates.push({
        team_id: teamId,
        id: goalie.id,
        role: 'player',
        position: 'G',
        line_number: index + 1
      });
    }
  });
  
  return updates;
};

