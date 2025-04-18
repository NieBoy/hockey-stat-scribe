
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Game } from '@/types';

interface GoalHeaderProps {
  game: Game;
  selectedTeam: 'home' | 'away' | null;
}

export function GoalHeader({ game, selectedTeam }: GoalHeaderProps) {
  return (
    <CardHeader>
      <CardTitle>
        {selectedTeam === 'home' 
          ? `${game.homeTeam.name} Goal` 
          : selectedTeam === 'away' 
            ? `${game.awayTeam.name} Goal` 
            : 'Record Goal'}
      </CardTitle>
    </CardHeader>
  );
}
