
import { useState, useEffect } from 'react';
import { Team, Lines } from '@/types';
import { getTeamLineup } from '@/services/teams/lineupManagement';
import { buildInitialLines } from '@/utils/lineupUtils';

export function useLineupData(team: Team, refreshKey: number) {
  const [lines, setLines] = useState<Lines>(() => buildInitialLines(team));
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        setLoadingState('loading');
        console.log("useLineupData - Fetching lineup for team:", team.id);
        
        const lineupData = await getTeamLineup(team.id);
        console.log("useLineupData - Retrieved lineup data:", lineupData);
        
        if (!lineupData || lineupData.length === 0) {
          console.log("useLineupData - No lineup data found, using initial lines");
          setLines(buildInitialLines(team));
          setLoadingState('success');
          setLastRefreshed(new Date());
          setError(null);
          return;
        }
        
        // Apply positions from database to the team players
        const updatedTeam = {
          ...team,
          players: team.players.map(player => {
            const lineupPlayer = lineupData.find(lp => lp.user_id === player.id);
            if (lineupPlayer && lineupPlayer.position) {
              return {
                ...player,
                position: lineupPlayer.position,
                lineNumber: lineupPlayer.line_number
              };
            }
            return player;
          })
        };
        
        const refreshedLines = buildInitialLines(updatedTeam);
        console.log("useLineupData - Built lines structure:", refreshedLines);
        setLines(refreshedLines);
        setLoadingState('success');
        setLastRefreshed(new Date());
        setError(null);
      } catch (error) {
        console.error("useLineupData - Error fetching lineup:", error);
        setLoadingState('error');
        setError(error instanceof Error ? error : new Error('Unknown error fetching lineup data'));
      }
    };
    
    fetchLineup();
  }, [team, refreshKey]);

  return {
    lines,
    loadingState,
    lastRefreshed,
    error,
    setLines
  };
}
