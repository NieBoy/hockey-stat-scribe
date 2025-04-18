
import { useState, useEffect } from 'react';
import { Game, User } from '@/types';
import { toast } from 'sonner';
import { getTeamLineup } from '@/services/teams/lineup';

export function useGoalFlow(game: Game, period: number, onComplete: () => void) {
  // Add state to track if lineup data has been fetched
  const [hasLoadedLineups, setHasLoadedLineups] = useState(false);
  const [isLoadingLineups, setIsLoadingLineups] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  
  // Load lineup data when the component mounts
  useEffect(() => {
    const loadLineupData = async () => {
      if (!selectedTeam || hasLoadedLineups) return;
      
      try {
        setIsLoadingLineups(true);
        const teamToLoad = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
        console.log("GoalFlow - Loading lineup data for team:", teamToLoad.id);
        
        const lineupData = await getTeamLineup(teamToLoad.id);
        console.log("GoalFlow - Retrieved lineup data:", lineupData);
        
        // Check if we have any real position data
        const hasPositions = lineupData.some(player => player.position !== null);
        
        if (!hasPositions) {
          console.warn("GoalFlow - No player positions found in the lineup data");
        }
        
        setHasLoadedLineups(true);
      } catch (error) {
        console.error("GoalFlow - Error loading lineup data:", error);
      } finally {
        setIsLoadingLineups(false);
      }
    };
    
    loadLineupData();
  }, [selectedTeam, game, hasLoadedLineups]);

  // Function to refresh lineup data
  const handleRefreshLineups = async () => {
    try {
      setIsLoadingLineups(true);
      const teamToLoad = selectedTeam === 'home' ? game.homeTeam : game.awayTeam;
      console.log("GoalFlow - Refreshing lineup data for team:", teamToLoad.id);
      
      await getTeamLineup(teamToLoad.id);
      
      // Force a re-render by updating state
      setHasLoadedLineups(false);
      setTimeout(() => setHasLoadedLineups(true), 0);
    } catch (error) {
      console.error("GoalFlow - Error refreshing lineup data:", error);
    } finally {
      setIsLoadingLineups(false);
    }
  };

  return {
    selectedTeam,
    hasLoadedLineups,
    isLoadingLineups,
    handleRefreshLineups,
    setSelectedTeam,
  };
}
