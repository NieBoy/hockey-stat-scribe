
import { Position, UserRole } from "@/types";

export interface TeamMemberData {
  id: string;
  user_id?: string;
  role?: string;
  position?: Position;
  line_number?: number;
  name?: string;
  email?: string;
  users?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
}

export interface ProcessedTeamMember {
  id: string;
  name: string;
  email?: string;
  role: UserRole[];
  position?: Position;
  lineNumber?: number;
  number?: string;
}

export const processTeamMember = (member: TeamMemberData, defaultName: string = 'Unknown Member'): ProcessedTeamMember => {
  const userData = member.users;
  
  return {
    id: member.id,
    name: member.name || (userData?.name || defaultName),
    email: member.email || userData?.email,
    role: member.role ? [member.role as UserRole] : ['player'],
    ...(member.position && { position: member.position as Position }),
    ...(member.line_number !== undefined && { 
      lineNumber: member.line_number,
      number: String(member.line_number)
    })
  };
};
