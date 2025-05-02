
import { useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import GameControls from './GameControls';
import EventHistory from './EventHistory';
import { useGameControl } from '@/hooks/useGameControl';
import { useQuery } from '@tanstack/react-query';
import { getGameById } from '@/services/games';
import LoadingSpinner from '@/components/ui/loading-spinner';
import GoalFlow from './GoalFlow';
import PenaltyFlow from './PenaltyFlow';
import FaceoffFlow from './FaceoffFlow';
import ShotsFlow from './ShotsFlow';
import HitsFlow from './HitsFlow';
import { useEventSelection } from '@/hooks/useEventSelection';
import { EventButtons } from './tracker/EventButtons';
import GameScoreDisplay from './GameScoreDisplay';

export default function EventTracker() {
  const { id: gameId } = useParams<{ id: string }>();
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

  const {
    flowState,
    handleEventSelect,
    handleFlowComplete,
    handleFlowCancel
  } = useEventSelection();

  const { data: game, isLoading } = useQuery({
    queryKey: ['games', gameId],
    queryFn: () => gameId ? getGameById(gameId) : null,
    enabled: !!gameId
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card className="p-6 flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (!game) {
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
        {/* Add Game Score Display */}
        {gameId && game && (
          <GameScoreDisplay gameId={gameId} game={game} />
        )}
        
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
          <EventButtons 
            onEventSelect={(eventType) => handleEventSelect(gameStatus, gameId, eventType)} 
          />
        )}

        {gameStatus === 'in-progress' && game && (
          <>
            {flowState === 'goal-flow' && (
              <GoalFlow 
                game={game}
                period={currentPeriod}
                onComplete={handleFlowComplete}
                onCancel={handleFlowCancel}
              />
            )}
            {flowState === 'penalty-flow' && (
              <PenaltyFlow
                game={game}
                period={currentPeriod}
                onComplete={handleFlowComplete}
                onCancel={handleFlowCancel}
              />
            )}
            {flowState === 'faceoff-flow' && (
              <FaceoffFlow
                game={game}
                period={currentPeriod}
                onComplete={handleFlowComplete}
                onCancel={handleFlowCancel}
              />
            )}
            {flowState === 'shot-flow' && (
              <ShotsFlow
                game={game}
                period={currentPeriod}
                onComplete={handleFlowComplete}
                onCancel={handleFlowCancel}
              />
            )}
            {flowState === 'hits-flow' && (
              <HitsFlow
                game={game}
                period={currentPeriod}
                onComplete={handleFlowComplete}
                onCancel={handleFlowCancel}
              />
            )}
          </>
        )}

        <EventHistory gameId={gameId || ''} />
      </Card>
    </div>
  );
}
