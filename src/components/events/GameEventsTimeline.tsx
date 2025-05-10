
import { GameEvent } from '@/types';
import { formatRelative } from 'date-fns';
import { 
  Target, 
  Flag, 
  Disc, 
  Shield, 
  Zap,
  Circle
} from 'lucide-react';

interface GameEventsTimelineProps {
  events: GameEvent[];
  isLoading?: boolean;
}

export default function GameEventsTimeline({ events, isLoading = false }: GameEventsTimelineProps) {
  if (isLoading) {
    return (
      <div className="py-4 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-6 w-36 bg-muted rounded"></div>
          <div className="mt-2 h-4 w-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        No events recorded for this game yet
      </div>
    );
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Target className="h-4 w-4" />;
      case 'penalty':
        return <Flag className="h-4 w-4" />;
      case 'faceoff':
        return <Disc className="h-4 w-4" />;
      case 'shot':
        return <Shield className="h-4 w-4" />;
      case 'hit':
        return <Zap className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const getEventLabel = (event: GameEvent) => {
    const teamType = event.team_type === 'home' ? 'Home' : 'Away';
    
    switch (event.event_type) {
      case 'goal':
        return `${teamType} Team Goal`;
      case 'penalty':
        return `${teamType} Team Penalty`;
      case 'faceoff':
        return `${teamType} Team Faceoff Win`;
      case 'shot':
        return `${teamType} Team Shot`;
      case 'hit':
        return `${teamType} Team Hit`;
      default:
        return `${teamType} Team ${event.event_type}`;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Game Timeline</h3>
      <div className="space-y-2">
        {events.map((event) => (
          <div key={event.id} className="flex items-center p-3 bg-muted/30 rounded-md">
            <div className="mr-3 bg-primary/10 p-2 rounded-full">
              {getEventIcon(event.event_type)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{getEventLabel(event)}</p>
              <p className="text-sm text-muted-foreground">
                Period {event.period} • {formatRelative(new Date(event.timestamp), new Date())}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
