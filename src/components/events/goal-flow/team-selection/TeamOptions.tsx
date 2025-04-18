
import { Game } from '@/types';
import { TeamOption } from './TeamOption';

interface TeamOptionsProps {
  game: Game;
  onTeamSelect: (team: 'home' | 'away') => void;
}

export function TeamOptions({ game, onTeamSelect }: TeamOptionsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <TeamOption 
        team={game.homeTeam}
        onClick={() => onTeamSelect('home')}
      />
      <TeamOption 
        team={game.awayTeam}
        onClick={() => onTeamSelect('away')}
      />
    </div>
  );
}
