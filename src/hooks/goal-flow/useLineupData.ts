
import { useState } from 'react';
import { Game, User } from '@/types';
import { toast } from 'sonner';
import { getTeamLineup } from '@/services/teams/lineup';

export function useLineupData() {
  const [hasLoadedLineups, setHasLoadedLineups] = useState(false);
  const [isLoadingLineups, setIsLoadingLineups] = useState(false);

  const loadLineupData = async (game: Game, teamType: 'home' | 'away') => {
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
        // Create a new copy of the team to avoid mutating the original
        const updatedTeam = teamType === 'home' 
          ? { ...game.homeTeam } 
          : { ...game.awayTeam };
        
        if (updatedTeam) {
          // Map the raw lineup data to the User type expected by the UI
          updatedTeam.players = lineupData.map(player => ({
            id: player.id, // Use team_member.id as the primary identifier
            name: player.name || 'Unknown Player',
            email: player.email || '',
            position: player.position || '',
            lineNumber: player.line_number
          }));
          
          // Update the game object with our modified team
          if (teamType === 'home') {
            game.homeTeam = updatedTeam;
          } else {
            game.awayTeam = updatedTeam;
          }
          
          console.log(`Updated ${teamType} team players:`, updatedTeam.players.length);
        }
      } else {
        console.warn("GoalFlow - No lineup data returned or unexpected format");
        toast.warning("No players found", {
          description: "Try adding players to this team in the team management screen."
        });
      }
      
      setHasLoadedLineups(true);
    } catch (error) {
      console.error("GoalFlow - Error loading lineup data:", error);
      toast.error("Failed to load team lineup", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsLoadingLineups(false);
    }
  };

  const handleRefreshLineups = async (game: Game, selectedTeam: 'home' | 'away' | null) => {
    if (!selectedTeam) {
      toast.error("No team selected");
      return;
    }
    await loadLineupData(game, selectedTeam);
  };

  return {
    hasLoadedLineups,
    setHasLoadedLineups,
    isLoadingLineups,
    loadLineupData,
    handleRefreshLineups
  };
}
