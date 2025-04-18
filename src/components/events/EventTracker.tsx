
import { useState, useEffect } from 'react';
import { Trophy, Flag, Clock, PlayCircle, StopCircle } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import EventButton from './EventButton';
import GameControls from './GameControls';
import EventHistory from './EventHistory';
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { useGameControl } from '@/hooks/useGameControl';

export default function EventTracker() {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const { id: gameId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { 
    isGameActive, 
    currentPeriod, 
    teamType,
    startGame, 
    stopGame, 
    setTeamType,
    advancePeriod,
    error
  } = useGameControl(gameId);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleEventSelect = async (eventType: EventType) => {
    if (!gameId || !isGameActive) return;

    try {
      const { error } = await supabase
        .from('game_events')
        .insert({
          game_id: gameId,
          event_type: eventType,
          period: currentPeriod,
          team_type: teamType,
        });

      if (error) throw error;

      setSelectedEvent(eventType);
      toast({
        title: "Event Recorded",
        description: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} has been recorded for ${teamType} team in period ${currentPeriod}.`
      });
      
      console.log('Event recorded:', { eventType, gameId, period: currentPeriod, team: teamType });
    } catch (error) {
      console.error('Error recording event:', error);
      toast({
        title: "Error",
        description: "Failed to record event. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            size="lg"
            variant={isGameActive ? "destructive" : "default"}
            className="w-full mb-4"
            onClick={isGameActive ? stopGame : startGame}
          >
            {isGameActive ? (
              <>
                <StopCircle className="mr-2 h-5 w-5" />
                Stop Game
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-5 w-5" />
                Start Game
              </>
            )}
          </Button>
        </div>

        {isGameActive && (
          <>
            <GameControls
              period={currentPeriod}
              teamType={teamType}
              onTeamChange={setTeamType}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EventButton
                label="Goal"
                icon={<Trophy className="h-8 w-8" />}
                onClick={() => handleEventSelect('goal')}
                className="bg-green-500 hover:bg-green-600"
              />
              <EventButton
                label="Penalty"
                icon={<Flag className="h-8 w-8" />}
                onClick={() => handleEventSelect('penalty')}
                className="bg-red-500 hover:bg-red-600"
              />
              <EventButton
                label="Timeout"
                icon={<Clock className="h-8 w-8" />}
                onClick={() => handleEventSelect('timeout')}
                className="bg-blue-500 hover:bg-blue-600 md:col-span-2"
              />
            </div>
          </>
        )}

        <EventHistory gameId={gameId || ''} />
      </Card>
    </div>
  );
}
