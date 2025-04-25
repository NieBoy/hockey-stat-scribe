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
  
  const [hasLoadedLineups, setHasLoadedLineups] = useState(false);
  const [isLoadingLineups, setIsLoadingLineups] = useState(false);

  const loadLineupData = async (teamType: 'home' | 'away') => {
    try {
      setIsLoadingLineups(true);
      const teamToLoad = teamType === 'home' ? game.homeTeam : game.awayTeam;
      
      if (!teamToLoad || !teamToLoad.id) {
        console.error("Cannot load lineup - invalid team data", teamType, game);
        toast.error("Failed to load team data", {
          description: "The selected team information is not available."
        });
        setIsLoadingLineups(false);
        return;
      }
      
      console.log("GoalFlow - Loading lineup data for team:", teamToLoad.id);
      
      const lineupData = await getTeamLineup(teamToLoad.id);
      console.log("GoalFlow - Retrieved lineup data:", lineupData);
      
      if (lineupData && Array.isArray(lineupData)) {
        const updatedTeam = teamType === 'home' ? game.homeTeam : game.awayTeam;
        if (updatedTeam) {
          updatedTeam.players = lineupData.map(player => ({
            id: player.id,
            name: player.name || 'Unknown Player',
            email: player.email,
            position: player.position,
            lineNumber: player.line_number
          }));
        }
      }
      
      setHasLoadedLineups(true);
    } catch (error) {
      console.error("GoalFlow - Error loading lineup data:", error);
      toast.error("Failed to load team lineup");
    } finally {
      setIsLoadingLineups(false);
    }
  };

  const handleRefreshLineups = async () => {
    if (!selectedTeam) return;
    await loadLineupData(selectedTeam);
  };

  const handleTeamSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    
    setCurrentStep('scorer-select');
    
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
  
  const handleNextStep = () => {
    setCurrentStep('submit');
  };

  const validatePlayers = () => {
    if (!game) return false;
    
    if (!selectedTeam) {
      toast.error("No team selected");
      return false;
    }
    
    const teamPlayers = selectedTeam === 'home' 
      ? (game.homeTeam?.players || []) 
      : (game.awayTeam?.players || []);
    
    const allValidPlayerIds = teamPlayers.map(p => p.id);
    
    if (!selectedScorer) {
      toast.error("No scorer selected");
      return false;
    }
    
    if (!playersOnIce || playersOnIce.length === 0) {
      toast.error("No players on ice selected");
      return false;
    }
    
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
    const uniquePlayers = [...new Map(players.map(p => [p.id, p])).values()];
    
    const mandatoryPlayers = [selectedScorer, primaryAssist, secondaryAssist].filter(Boolean) as User[];
    
    const allPlayers = [...uniquePlayers];
    
    mandatoryPlayers.forEach(requiredPlayer => {
      if (requiredPlayer && !allPlayers.some(p => p.id === requiredPlayer.id)) {
        allPlayers.push(requiredPlayer);
      }
    });
    
    const limitedPlayers = allPlayers.slice(0, 6);
    
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

      if (selectedScorer) goalData.scorerId = selectedScorer.id;
      if (primaryAssist) goalData.primaryAssistId = primaryAssist.id;
      if (secondaryAssist) goalData.secondaryAssistId = secondaryAssist.id;
      
      console.log("Goal data to be submitted:", goalData);
      await recordGoalEvent(goalData);

      const teamName = selectedTeam === 'home' 
        ? game.homeTeam?.name || 'Home team'
        : game.awayTeam?.name || 'Away team';
        
      toast.success("Goal Recorded", {
        description: `Goal by ${selectedScorer?.name || 'Unknown player'} (${teamName})`
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
