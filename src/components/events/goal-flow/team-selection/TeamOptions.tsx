
import { Game } from '@/types';
import { TeamOption } from './TeamOption';
import { ensureTeamCompatibility } from '@/utils/typeConversions';

interface TeamOptionsProps {
  game: Game;
  onTeamSelect: (team: 'home' | 'away') => void;
}

export function TeamOptions({ game, onTeamSelect }: TeamOptionsProps) {
  // Convert TeamDetails to Team type
  const homeTeam = ensureTeamCompatibility(game.homeTeam);
  const awayTeam = ensureTeamCompatibility(game.awayTeam);
  
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TeamOption 
        team={homeTeam}
        onClick={() => onTeamSelect('home')}
      />
      <TeamOption 
        team={awayTeam}
        onClick={() => onTeamSelect('away')}
      />
    </div>
  );
}
