
import { GameStat, PlayerStat, User } from '@/types';

// These mock data are kept for compatibility with other parts of the app
// that might still be using them. Gradually we'll eliminate these too.
export const mockUsers: User[] = [];
export const mockTeams = [];
export const mockStatTrackers = [];
export const mockGames = [];
export const mockGameStats: GameStat[] = [];
export const mockPlayerStats: PlayerStat[] = [];

// Current mock user (simulating logged in user)
export const currentUser: User = {
  id: '',
  name: '',
  role: ['player']
};
