
import { TeamMemberData, ProcessedTeamMember, processTeamMember } from "../types/teamMember";
import { UserRole } from "@/types";

export interface TeamMembersByRole {
  players: ProcessedTeamMember[];
  coaches: ProcessedTeamMember[];
  parents: ProcessedTeamMember[];
}

export const processTeamMembersByRole = (members: TeamMemberData[]): TeamMembersByRole => {
  const players = members
    .filter(member => member.role === 'player')
    .map(p => processTeamMember(p, 'Unknown Player'));
  
  const coaches = members
    .filter(member => member.role === 'coach')
    .map(c => processTeamMember(c, 'Unknown Coach'));
    
  const parents = members
    .filter(member => member.role === 'parent')
    .map(p => processTeamMember(p, 'Unknown Parent'));
    
  return { players, coaches, parents };
};
