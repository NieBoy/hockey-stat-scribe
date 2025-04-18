
import { usePeriodControl } from './game/usePeriodControl';
import { useGameStatus } from './game/useGameStatus';
import { useTeamControl } from './game/useTeamControl';
import { useGameSubscription } from './game/useGameSubscription';

export function useGameControl(gameId?: string) {
  const { 
    currentPeriod, 
    setCurrentPeriod, 
    handlePeriodEnd 
  } = usePeriodControl(gameId);

  const {
    isGameActive,
    setIsGameActive,
    gameStatus,
    setGameStatus,
    stopReason,
    setStopReason,
    startGame,
    stopGame,
    handleStoppage
  } = useGameStatus(gameId);

  const { teamType, setTeamType } = useTeamControl();

  // Use the subscription hook with more defensive handling
  // This should be the ONLY place where we sync with the database
  useGameSubscription({
    gameId,
    setIsGameActive,
    setCurrentPeriod,
    setGameStatus,
    gameStatus
  });

  // Enhanced debugging for better visibility into state transitions
  console.log("useGameControl state:", {
    isGameActive,
    currentPeriod,
    gameStatus,
    stopReason,
    teamType,
    gameId: gameId || 'undefined'
  });

  return {
    isGameActive,
    currentPeriod,
    teamType,
    gameStatus,
    stopReason,
    startGame,
    stopGame,
    handlePeriodEnd,
    handleStoppage,
    setTeamType,
    setStopReason
  };
}
