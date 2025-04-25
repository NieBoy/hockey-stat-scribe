
import { useState } from 'react';
import { User, Game } from '@/types';
import { toast } from 'sonner';
import { recordGoalEvent } from '@/services/events/goalEventService';
import { getTeamLineup } from '@/services/teams/lineup';

type FlowStep = 'team-select' | 'scorer-select' | 'primary-assist' | 'secondary-assist' | 'players-on-ice' | 'submit';

export function useGoalFlow(game: Game, period: number, onComplete: () => void) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('team-select');
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedScorer, setSelectedScorer] = useState<User | null>(null);
  const [primaryAssist, setPrimaryAssist] = useState<User | null>(null);
  const [secondaryAssist, setSecondaryAssist] = useState<User | null>(null);
  const [playersOnIce, setPlayersOnIce] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add state to track lineup data loading
  const [hasLoadedLineups, setHasLoadedLineups] = useState(false);
  const [isLoadingLineups, setIsLoadingLineups] = useState(false);

  // Function to load lineup data when a team is selected
  const loadLineupData = async (teamType: 'home' | 'away') => {
    if (hasLoadedLineups) return;
    
    try {
      setIsLoadingLineups(true);
      const teamToLoad = teamType === 'home' ? game.homeTeam : game.awayTeam;
      
      if (!teamToLoad || !teamToLoad.id) {
        console.warn("Cannot load lineup - invalid team data");
        setIsLoadingLineups(false);
        return;
      }
      
      console.log("GoalFlow - Loading lineup data for team:", teamToLoad.id);
      
      const lineupData = await getTeamLineup(teamToLoad.id);
      console.log("GoalFlow - Retrieved lineup data:", lineupData);
      
      setHasLoadedLineups(true);
    } catch (error) {
      console.error("GoalFlow - Error loading lineup data:", error);
      toast.error("Failed to load team lineup");
    } finally {
      setIsLoadingLineups(false);
    }
  };

  // Function to refresh lineup data
  const handleRefreshLineups = async () => {
    if (!selectedTeam) return;
    
    try {
      setIsLoadingLineups(true);
      const teamToLoad = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
      
      if (!teamToLoad || !teamToLoad.id) {
        console.warn("Cannot refresh lineup - invalid team data");
        setIsLoadingLineups(false);
        return;
      }
      
      console.log("GoalFlow - Refreshing lineup data for team:", teamToLoad.id);
      
      await getTeamLineup(teamToLoad.id);
      
      // Force a re-render by updating state
      setHasLoadedLineups(false);
      setTimeout(() => setHasLoadedLineups(true), 0);
    } catch (error) {
      console.error("GoalFlow - Error refreshing lineup data:", error);
      toast.error("Failed to refresh team lineup");
    } finally {
      setIsLoadingLineups(false);
    }
  };

  const handleTeamSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    
    // Always go to scorer selection regardless of team type
    setCurrentStep('scorer-select');
    
    // Load lineup data for the selected team
    loadLineupData(team);
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
  
  // Function to handle moving to the next step
  const handleNextStep = () => {
    setCurrentStep('submit');
  };

  const validatePlayers = () => {
    if (!game) return false;
    
    const homeTeamPlayers = game.homeTeam?.players || [];
    const awayTeamPlayers = game.awayTeam?.players || [];
    const allValidPlayerIds = [...homeTeamPlayers, ...awayTeamPlayers].map(p => p.id);
    
    for (const player of playersOnIce) {
      if (!player || !player.id || !allValidPlayerIds.includes(player.id)) {
        toast.error("Invalid Player", {
          description: `Player ${player?.name || 'Unknown'} (${player?.id || 'no ID'}) is not valid in this game.`
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
    if (!selectedTeam || !game?.id) {
      toast.error("Missing Data", {
        description: "Team or game information is missing"
      });
      return;
    }

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
      if (selectedScorer) goalData.scorerId = selectedScorer.id;
      if (primaryAssist) goalData.primaryAssistId = primaryAssist.id;
      if (secondaryAssist) goalData.secondaryAssistId = secondaryAssist.id;
      
      console.log("Goal data to be submitted:", goalData);
      await recordGoalEvent(goalData);

      toast.success("Goal Recorded", {
        description: selectedTeam === 'home' 
          ? `Goal by ${selectedScorer?.name || 'Unknown player'}`
          : `Goal against by ${game.awayTeam?.name || 'Away team'}`
      });

      onComplete();
    } catch (error: any) {
      console.error("Error recording goal:", error);
      toast.error("Error", {
        description: error.message || "Failed to record goal event"
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
    isLoadingLineups,
    hasLoadedLineups,
    handleRefreshLineups,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
    handleNextStep,
    handleSubmit
  };
}
