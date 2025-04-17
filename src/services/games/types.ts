
import { Game, Team, User, UserRole, Position } from '@/types';

// Export interface used within the games service
export interface GameWithTeams extends Game {
  homeTeam: Team;
  awayTeam: Team;
}

export interface TeamMemberData {
  id: string;
  user_id?: string;
  name?: string;
  email?: string;
  role: string;
  position?: string;
  line_number?: number;
}
