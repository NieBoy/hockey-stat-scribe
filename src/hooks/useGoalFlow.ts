
import { Game, User } from '@/types';
import { useLineupData } from './goal-flow/useLineupData';
import { usePlayerSelection } from './goal-flow/usePlayerSelection';
import { useFlowNavigation } from './goal-flow/useFlowNavigation';
import { useGoalSubmission } from './goal-flow/useGoalSubmission';

export function useGoalFlow(game: Game, period: number, onComplete: () => void) {
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
    setSelectedTeam,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
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
    handleNextStep
  } = useFlowNavigation();

  const { handleSubmit: submitGoal } = useGoalSubmission(onComplete);

  // Enhanced team selection handler that loads lineup data
  const handleTeamSelection = (team: 'home' | 'away') => {
    handleTeamSelect(team);
    goToScorerStep();
    loadLineupData(game, team);
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
  
  // Wrapper for submitting the goal event
  const handleSubmit = async () => {
    if (!validatePlayers(game.id)) {
      return;
    }

    await submitGoal(
      game.id, 
      period, 
      selectedTeam, 
      playersOnIce, 
      selectedScorer, 
      primaryAssist, 
      secondaryAssist,
      game
    );
  };

  // Handle refreshing lineups
  const refreshLineups = () => {
    return handleRefreshLineups(game, selectedTeam);
  };

  return {
    currentStep,
    selectedTeam,
    selectedScorer,
    primaryAssist,
    secondaryAssist,
    playersOnIce,
    isSubmitting,
    isLoadingLineups,
    hasLoadedLineups,
    handleRefreshLineups: refreshLineups,
    handleTeamSelect: handleTeamSelection,
    handleScorerSelect: handleScorerSelection,
    handlePrimaryAssistSelect: handlePrimaryAssistSelection,
    handleSecondaryAssistSelect: handleSecondaryAssistSelection,
    handlePlayersOnIceSelect,
    handleNextStep,
    handleSubmit
  };
}
