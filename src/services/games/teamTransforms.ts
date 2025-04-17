
import { Team, User, UserRole, Position } from '@/types';
import { TeamMemberData } from './types';

// Helper function to transform team member data into User objects
export const mapTeamMemberToUser = (member: TeamMemberData): User => ({
  id: member.user_id || member.id,
  name: member.name || '',
  email: member.email,
  role: [member.role as UserRole], // Convert string to array of UserRole
  position: member.position as Position, // Cast to Position type
  lineNumber: member.line_number,
  number: member.line_number ? String(member.line_number) : undefined
});

// Helper function to transform team members into a Team object
export const transformTeamData = (
  teamId: string,
  teamName: string,
  teamMembers: TeamMemberData[] = []
): Team => ({
  id: teamId,
  name: teamName,
  players: (teamMembers || [])
    .filter(m => m.role === 'player')
    .map(mapTeamMemberToUser),
  coaches: (teamMembers || [])
    .filter(m => m.role === 'coach')
    .map(mapTeamMemberToUser),
  parents: (teamMembers || [])
    .filter(m => m.role === 'parent')
    .map(mapTeamMemberToUser)
});
