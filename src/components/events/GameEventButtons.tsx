
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Game, GameEvent } from '@/types';
import { 
  Flag, 
  Target, 
  Disc, 
  Swords,
  AlertTriangle
} from 'lucide-react';

interface GameEventButtonsProps {
  game: Game;
  period: number;
  onEventAdded: (event: Partial<GameEvent>) => Promise<any>;
}

export default function GameEventButtons({ game, period, onEventAdded }: GameEventButtonsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEvent = async (eventType: string, teamType: 'home' | 'away') => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onEventAdded({
        event_type: eventType,
        period,
        team_type: teamType
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">{game.homeTeam.name} Events</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('goal', 'home')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Target className="h-4 w-4" />
            Goal
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('penalty', 'home')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Flag className="h-4 w-4" />
            Penalty
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('faceoff', 'home')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Disc className="h-4 w-4" />
            Face-off Win
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('shot', 'home')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Target className="h-4 w-4" />
            Shot
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('hit', 'home')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Swords className="h-4 w-4" />
            Hit
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">{game.awayTeam.name || 'Opponent'} Events</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('goal', 'away')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Target className="h-4 w-4" />
            Goal
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('penalty', 'away')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Flag className="h-4 w-4" />
            Penalty
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('faceoff', 'away')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Disc className="h-4 w-4" />
            Face-off Win
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('shot', 'away')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Target className="h-4 w-4" />
            Shot
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleAddEvent('hit', 'away')}
            className="flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            <Swords className="h-4 w-4" />
            Hit
          </Button>
        </div>
      </div>
      
      <div className="text-center text-xs text-muted-foreground">
        <AlertTriangle className="h-3 w-3 inline mr-1" />
        Events cannot be edited after they are added
      </div>
    </div>
  );
}
