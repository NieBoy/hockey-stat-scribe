
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { processEventsToStats } from '@/services/stats/core/gameEventProcessor';

export type GameStatus = 'pending' | 'in-progress' | 'period-end' | 'stopped' | 'completed';

export function useGameStatus(gameId?: string) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>('pending');
  const [stopReason, setStopReason] = useState<string>('');
  
  // Fetch initial game status
  const { data: game } = useQuery({
    queryKey: ['gameStatus', gameId],
    queryFn: async () => {
      if (!gameId) return null;
      
      const { data, error } = await supabase
        .from('games')
        .select('is_active, current_period')
        .eq('id', gameId)
        .single();
      
      if (error) {
        console.error("Error fetching game status:", error);
        return null;
      }
      
      setIsGameActive(data.is_active);
      if (data.is_active) {
        setGameStatus('in-progress');
      }
      
      return data;
    },
    enabled: !!gameId
  });
  
  // Start the game
  const startGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { error } = await supabase
        .from('games')
        .update({ is_active: true })
        .eq('id', gameId);
      
      if (error) throw error;
      
      setIsGameActive(true);
      setGameStatus('in-progress');
      console.log("Game started");
    } catch (error) {
      console.error("Error starting game:", error);
    }
  }, [gameId]);
  
  // Stop the game
  const stopGame = useCallback(async () => {
    if (!gameId) return;
    
    try {
      const { error } = await supabase
        .from('games')
        .update({ is_active: false })
        .eq('id', gameId);
      
      if (error) throw error;
      
      setIsGameActive(false);
      setGameStatus('stopped');
      console.log("Game stopped");
      
      // When a game is stopped/completed, process all events to stats
      try {
        // First get the game teams
        const { data: gameData } = await supabase
          .from('games')
          .select('home_team_id, away_team_id')
          .eq('id', gameId)
          .single();
          
        if (gameData) {
          const teamIds = [gameData.home_team_id];
          if (gameData.away_team_id) teamIds.push(gameData.away_team_id);
          
          // For each team, get players
          for (const teamId of teamIds) {
            const { data: players } = await supabase
              .from('team_members')
              .select('id, name')
              .eq('team_id', teamId)
              .eq('role', 'player');
              
            if (players && players.length > 0) {
              // Get all events for this game
              const { data: events } = await supabase
                .rpc('get_game_events', { p_game_id: gameId });
                
              if (events && events.length > 0) {
                console.log(`Processing ${events.length} events for ${players.length} players`);
                // Process events for each player
                for (const player of players) {
                  await processEventsToStats(player.id, events);
                }
                toast.success("Game stats have been processed");
              }
            }
          }
        }
      } catch (processError) {
        console.error("Error processing game stats on end:", processError);
      }
      
    } catch (error) {
      console.error("Error stopping game:", error);
    }
  }, [gameId]);
  
  // Handle stoppage
  const handleStoppage = useCallback((reason: string) => {
    setStopReason(reason);
    setGameStatus('stopped');
  }, []);
  
  return {
    isGameActive,
    setIsGameActive,
    gameStatus,
    setGameStatus,
    stopReason,
    setStopReason,
    startGame,
    stopGame,
    handleStoppage
  };
}
