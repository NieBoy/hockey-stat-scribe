import { useState } from 'react';
import { Trophy, Flag, Clock, Target } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import EventButton from './EventButton';
import GameControls from './GameControls';
import EventHistory from './EventHistory';
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useGameControl } from '@/hooks/useGameControl';
import GoalFlow from './GoalFlow';
import PenaltyFlow from './PenaltyFlow';
import { useQuery } from '@tanstack/react-query';
import { getGameById } from '@/services/games';
import LoadingSpinner from '@/components/ui/loading-spinner';
import FaceoffFlow from './FaceoffFlow';
import ShotsFlow from './ShotsFlow';

type EventType = 'goal' | 'penalty' | 'faceoff' | 'shot';
type FlowState = 'buttons' | 'goal-flow' | 'penalty-flow' | 'faceoff-flow' | 'shot-flow';

export default function EventTracker() {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [flowState, setFlowState] = useState<FlowState>('buttons');
  const { id: gameId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { 
    isGameActive,
    currentPeriod, 
    teamType,
    gameStatus,
    startGame, 
    stopGame, 
    handlePeriodEnd,
    handleStoppage,
    setTeamType,
  } = useGameControl(gameId);

  const { data: game, isLoading } = useQuery({
    queryKey: ['games', gameId],
    queryFn: () => gameId ? getGameById(gameId) : null,
    enabled: !!gameId && gameStatus === 'in-progress'
  });

  console.log('EventTracker rendering with:', { 
    gameStatus, 
    period: currentPeriod, 
    isGameActive,
    teamType,
    flowState
  });

  const handleEventSelect = (eventType: EventType) => {
    if (!gameId || gameStatus !== 'in-progress') {
      console.log("Cannot record event - game not in progress:", gameStatus);
      return;
    }

    setSelectedEvent(eventType);

    if (eventType === 'goal') {
      setFlowState('goal-flow');
    } else if (eventType === 'penalty') {
      setFlowState('penalty-flow');
    } else if (eventType === 'faceoff') {
      setFlowState('faceoff-flow');
    } else if (eventType === 'shot') {
      setFlowState('shot-flow');
    }
  };

  const recordBasicEvent = async (eventType: EventType) => {
    try {
      console.log('Recording event:', { 
        eventType, 
        period: currentPeriod, 
        team: teamType 
      });
      
      const { error: apiError } = await supabase
        .from('game_events')
        .insert({
          game_id: gameId,
          event_type: eventType,
          period: currentPeriod,
          team_type: teamType,
        });

      if (apiError) throw apiError;

      toast({
        title: "Event Recorded",
        description: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} has been recorded for ${teamType} team in period ${currentPeriod}.`
      });
      
      console.log('Event successfully recorded');
    } catch (err: any) {
      console.error('Error recording event:', err);
      toast({
        title: "Error",
        description: "Failed to record event. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFlowComplete = () => {
    setFlowState('buttons');
    setSelectedEvent(null);
  };

  const handleFlowCancel = () => {
    setFlowState('buttons');
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6 flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (!game && gameStatus === 'in-progress') {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6">
          <p>Game not found. Please check the game ID and try again.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6">
        <GameControls
          period={currentPeriod}
          teamType={teamType}
          gameStatus={gameStatus}
          onTeamChange={setTeamType}
          onStartGame={startGame}
          onStopGame={stopGame}
          onPeriodEnd={handlePeriodEnd}
          onStoppage={handleStoppage}
        />
        
        {gameStatus === 'in-progress' && flowState === 'buttons' && (
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
              label="Faceoff"
              icon={<Clock className="h-8 w-8" />}
              onClick={() => handleEventSelect('faceoff')}
              className="bg-blue-500 hover:bg-blue-600"
            />
            <EventButton
              label="Shot"
              icon={<Target className="h-8 w-8" />}
              onClick={() => handleEventSelect('shot')}
              className="bg-purple-500 hover:bg-purple-600"
            />
          </div>
        )}

        {gameStatus === 'in-progress' && flowState === 'goal-flow' && game && (
          <GoalFlow 
            game={game}
            period={currentPeriod}
            onComplete={handleFlowComplete}
            onCancel={handleFlowCancel}
          />
        )}

        {gameStatus === 'in-progress' && flowState === 'penalty-flow' && game && (
          <PenaltyFlow
            game={game}
            period={currentPeriod}
            onComplete={handleFlowComplete}
            onCancel={handleFlowCancel}
          />
        )}

        {gameStatus === 'in-progress' && flowState === 'faceoff-flow' && game && (
          <FaceoffFlow
            game={game}
            period={currentPeriod}
            onComplete={handleFlowComplete}
            onCancel={handleFlowCancel}
          />
        )}

        {gameStatus === 'in-progress' && flowState === 'shot-flow' && game && (
          <ShotsFlow
            game={game}
            period={currentPeriod}
            onComplete={handleFlowComplete}
            onCancel={handleFlowCancel}
          />
        )}

        <EventHistory gameId={gameId || ''} />
      </Card>
    </div>
  );
}
