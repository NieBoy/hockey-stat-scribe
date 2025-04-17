
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

// Define the database response shape for games
export interface GameDbResponse {
  id: string;
  date: string;
  location: string;
  home_team_id: string;
  away_team_id: string;
  periods: number;
  current_period: number;
  is_active: boolean;
  created_at: string;
  home_team: {
    id: string;
    name: string;
  };
  away_team: {
    id: string;
    name: string;
  };
}
