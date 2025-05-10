
import { GameEvent, Game } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface GameEventsTimelineProps {
  events: GameEvent[];
  game: Game;
}

export default function GameEventsTimeline({ events, game }: GameEventsTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Game Events</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">No events recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  // Map event types to friendly names
  const getEventTypeLabel = (type: string): string => {
    const eventTypeMap: Record<string, string> = {
      'goal': 'Goal',
      'penalty': 'Penalty',
      'faceoff': 'Face-off',
      'shot': 'Shot',
      'hit': 'Hit'
    };
    
    return eventTypeMap[type] || type;
  };

  // Get team name based on team type
  const getTeamName = (teamType: string): string => {
    if (teamType === 'home') return game.homeTeam?.name || 'Home Team';
    if (teamType === 'away') return game.awayTeam?.name || 'Away Team';
    return 'Unknown Team';
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Game Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="flex items-start gap-4">
              <div className="min-w-[80px] text-sm text-muted-foreground">
                Period {event.period}
                <div className="text-xs">{format(new Date(event.timestamp), 'h:mm a')}</div>
              </div>
              <div>
                <div className="font-medium">
                  {getEventTypeLabel(event.event_type)} - {getTeamName(event.team_type)}
                </div>
                {event.details && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {JSON.stringify(event.details)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
