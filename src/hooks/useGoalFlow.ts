
import { useState } from 'react';
import { User, Game } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { recordGoalEvent } from '@/services/events/goalEventService';

type FlowStep = 'team-select' | 'scorer-select' | 'primary-assist' | 'secondary-assist' | 'players-on-ice' | 'submit';

export function useGoalFlow(game: Game, period: number, onComplete: () => void) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('team-select');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedScorer, setSelectedScorer] = useState<User | null>(null);
  const [primaryAssist, setPrimaryAssist] = useState<User | null>(null);
  const [secondaryAssist, setSecondaryAssist] = useState<User | null>(null);
  const [playersOnIce, setPlayersOnIce] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTeamSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    if (team === 'home') {
      setCurrentStep('scorer-select');
    } else {
      setCurrentStep('players-on-ice');
    }
  };

  const handleScorerSelect = (player: User) => {
    setSelectedScorer(player);
    setCurrentStep('primary-assist');
  };

  const handlePrimaryAssistSelect = (player: User | null) => {
    setPrimaryAssist(player);
    setCurrentStep('secondary-assist');
  };

  const handleSecondaryAssistSelect = (player: User | null) => {
    setSecondaryAssist(player);
    setCurrentStep('players-on-ice');
  };
  
  // New function to handle moving to the next step
  const handleNextStep = () => {
    setCurrentStep('submit');
  };

  const validatePlayers = () => {
    const allValidPlayerIds = [...game.homeTeam.players, ...game.awayTeam.players].map(p => p.id);
    
    for (const player of playersOnIce) {
      if (!allValidPlayerIds.includes(player.id)) {
        toast({
          title: "Invalid Player",
          description: `Player ${player.name} (${player.id}) is not valid in this game.`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handlePlayersOnIceSelect = (players: User[]) => {
    console.log("handlePlayersOnIceSelect called with players:", players);
    
    // Create a new array with unique players
    const uniquePlayers = [...new Map(players.map(p => [p.id, p])).values()];
    
    // Add mandatory players (scorer, primary assist, secondary assist) if not already included
    const mandatoryPlayers = [selectedScorer, primaryAssist, secondaryAssist].filter(Boolean) as User[];
    
    const allPlayers = [...uniquePlayers];
    
    // Add any mandatory players not already in the selection
    mandatoryPlayers.forEach(requiredPlayer => {
      if (requiredPlayer && !allPlayers.some(p => p.id === requiredPlayer.id)) {
        allPlayers.push(requiredPlayer);
      }
    });
    
    // Limit to 6 players maximum
    const limitedPlayers = allPlayers.slice(0, 6);
    
    console.log("Final players on ice set to:", limitedPlayers);
    setPlayersOnIce(limitedPlayers);
  };

  const handleSubmit = async () => {
    if (!selectedTeam || !game.id) return;

    if (!validatePlayers()) {
      return;
    }

    setIsSubmitting(true);
    console.log("Submitting goal with players:", playersOnIce);

    try {
      // Create the goal data with the base properties
      const goalData: {
        gameId: string;
        period: number;
        teamType: 'home' | 'away';
        playersOnIce: string[];
        scorerId?: string;
        primaryAssistId?: string;
        secondaryAssistId?: string;
      } = {
        gameId: game.id,
        period,
        teamType: selectedTeam,
        playersOnIce: playersOnIce.map(p => p.id)
      };

      // Add optional properties conditionally
      if (selectedTeam === 'home') {
        if (selectedScorer) goalData.scorerId = selectedScorer.id;
        if (primaryAssist) goalData.primaryAssistId = primaryAssist.id;
        if (secondaryAssist) goalData.secondaryAssistId = secondaryAssist.id;
      }
      
      console.log("Goal data to be submitted:", goalData);
      await recordGoalEvent(goalData);

      toast({
        title: "Goal Recorded",
        description: selectedTeam === 'home' 
          ? `Goal by ${selectedScorer?.name || 'Unknown player'}`
          : `Goal against by ${game.awayTeam?.name || 'Away team'}`
      });

      onComplete();
    } catch (error: any) {
      console.error("Error recording goal:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to record goal event",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    currentStep,
    selectedTeam,
    selectedScorer,
    primaryAssist,
    secondaryAssist,
    playersOnIce,
    isSubmitting,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
    handleNextStep,
    handleSubmit
  };
}
