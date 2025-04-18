
import { usePeriodControl } from './game/usePeriodControl';
import { useGameStatus } from './game/useGameStatus';
import { useTeamControl } from './game/useTeamControl';
import { useGameSubscription } from './game/useGameSubscription';
import { useCallback, useEffect } from 'react';

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

  // Custom period end handler that ensures we transition back to in-progress
  const handlePeriodEndWithTransition = useCallback(async () => {
    await handlePeriodEnd();
    
    // After handling period end, if we're not at the final period,
    // transition back to in-progress state
    if (currentPeriod < 3) {
      console.log("Period ended, transitioning back to in-progress state");
      setGameStatus('in-progress');
    }
  }, [handlePeriodEnd, currentPeriod, setGameStatus]);

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
    handlePeriodEnd: handlePeriodEndWithTransition,
    handleStoppage,
    setTeamType,
    setStopReason
  };
}
