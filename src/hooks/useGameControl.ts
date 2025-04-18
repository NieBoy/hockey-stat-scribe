
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

  // Use the new subscription hook
  useGameSubscription({
    gameId,
    setIsGameActive,
    setCurrentPeriod,
    setGameStatus,
    gameStatus
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
