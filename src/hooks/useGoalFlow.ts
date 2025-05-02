
import { Game, User } from '@/types';
import { useLineupData } from './goal-flow/useLineupData';
import { usePlayerSelection } from './goal-flow/usePlayerSelection';
import { useFlowNavigation } from './goal-flow/useFlowNavigation';
import { useGoalSubmission } from './goal-flow/useGoalSubmission';
import { useState, useEffect } from 'react';

export function useGoalFlow(game: Game, period: number, onComplete: () => void) {
  const [homeTeamLoadAttempted, setHomeTeamLoadAttempted] = useState(false);
  
  const {
    hasLoadedLineups,
    isLoadingLineups,
    loadLineupData,
    handleRefreshLineups
  } = useLineupData();

  const {
    selectedTeam,
    selectedScorer,
    primaryAssist,
    secondaryAssist,
    playersOnIce,
    isOpponentTeam,
    opponentJerseyNumbers,
    setSelectedTeam,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
    handleOpponentJerseyNumber,
    validatePlayers
  } = usePlayerSelection();

  const {
    currentStep,
    isSubmitting,
    setIsSubmitting,
    goToScorerStep,
    goToPrimaryAssistStep,
    goToSecondaryAssistStep,
    goToPlayersOnIceStep,
    goToSubmitStep,
    goToOpponentGoalStep,
    handleNextStep
  } = useFlowNavigation();

  const { handleSubmit: submitGoal, isSubmitting: isGoalSubmitting } = useGoalSubmission(onComplete);

  // Enhanced team selection handler that loads lineup data
  const handleTeamSelection = (team: 'home' | 'away') => {
    handleTeamSelect(team);
    
    // Different flow for opponent team (away) vs home team
    if (team === 'away') {
      // For opponent team, we always need to load home team data for plus/minus
      if (!homeTeamLoadAttempted) {
        console.log("Loading home team data for opponent goal");
        loadLineupData(game, 'home');
        setHomeTeamLoadAttempted(true);
      }
      
      // Opponent team - go to opponent goal form
      goToOpponentGoalStep();
    } else {
      // Regular team with players - go to scorer selection
      goToScorerStep();
      loadLineupData(game, team);
    }
  };

  // Enhanced scorer selection handler
  const handleScorerSelection = (player: User) => {
    handleScorerSelect(player);
    goToPrimaryAssistStep();
  };

  // Enhanced primary assist selection handler
  const handlePrimaryAssistSelection = (player: User | null) => {
    handlePrimaryAssistSelect(player);
    goToSecondaryAssistStep();
  };

  // Enhanced secondary assist selection handler
  const handleSecondaryAssistSelection = (player: User | null) => {
    handleSecondaryAssistSelect(player);
    goToPlayersOnIceStep();
  };
  
  // Handle opponent goal form completion
  const handleOpponentGoalComplete = () => {
    // Make sure we load home team data for plus/minus before proceeding
    if (!homeTeamLoadAttempted) {
      console.log("Loading home team data before players on ice step");
      loadLineupData(game, 'home');
      setHomeTeamLoadAttempted(true);
    }
    goToPlayersOnIceStep();
  };
  
  // Wrapper for submitting the goal event
  const handleSubmit = async () => {
    console.log("handleSubmit called in useGoalFlow");
    if (!validatePlayers(game.id)) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await submitGoal(
        game.id, 
        period, 
        selectedTeam, 
        playersOnIce, 
        selectedScorer, 
        primaryAssist, 
        secondaryAssist,
        game,
        isOpponentTeam,
        opponentJerseyNumbers
      );
      // The onComplete callback is called inside submitGoal
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setIsSubmitting(false);
    }
  };

  // Handle refreshing lineups
  const refreshLineups = () => {
    // For opponent goals, refresh the home team data
    if (isOpponentTeam) {
      console.log("Refreshing home team data for opponent goal");
      setHomeTeamLoadAttempted(false);
      return handleRefreshLineups(game, 'home');
    }
    
    return handleRefreshLineups(game, selectedTeam);
  };

  return {
    currentStep,
    selectedTeam,
    selectedScorer,
    primaryAssist,
    secondaryAssist,
    playersOnIce,
    isSubmitting: isSubmitting || isGoalSubmitting,
    isLoadingLineups,
    hasLoadedLineups,
    isOpponentTeam,
    opponentJerseyNumbers,
    handleRefreshLineups: refreshLineups,
    handleTeamSelect: handleTeamSelection,
    handleScorerSelect: handleScorerSelection,
    handlePrimaryAssistSelect: handlePrimaryAssistSelection,
    handleSecondaryAssistSelect: handleSecondaryAssistSelection,
    handlePlayersOnIceSelect,
    handleOpponentJerseyNumber,
    handleOpponentGoalComplete,
    handleNextStep,
    handleSubmit
  };
}
