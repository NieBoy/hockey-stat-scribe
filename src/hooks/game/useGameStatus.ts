import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { processEventsToStats } from '@/services/stats/core/gameEventProcessor';
import { GameStatus } from '@/types/game-control';

export function useGameStatus(gameId?: string) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>('not-started');
  const [stopReason, setStopReason] = useState<string>('');
  const [isProcessingStats, setIsProcessingStats] = useState(false);
  
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
      toast.error("Failed to start game");
    }
  }, [gameId]);
  
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
      
      setIsProcessingStats(true);
      toast.loading("Processing game statistics...");
      
      try {
        const { data: gameData, error: gameError } = await supabase
          .from('games')
          .select('home_team_id, away_team_id')
          .eq('id', gameId)
          .single();
          
        if (gameError) {
          console.error("Error fetching game data:", gameError);
          throw gameError;
        }
        
        if (gameData) {
          const teamIds = [gameData.home_team_id];
          if (gameData.away_team_id) teamIds.push(gameData.away_team_id);
          
          let successCount = 0;
          let playerCount = 0;
          
          for (const teamId of teamIds) {
            const { data: players, error: playersError } = await supabase
              .from('team_members')
              .select('id, name')
              .eq('team_id', teamId)
              .eq('role', 'player');
              
            if (playersError) {
              console.error("Error fetching team players:", playersError);
              continue;
            }
            
            if (players && players.length > 0) {
              playerCount += players.length;
              
              const { data: events, error: eventsError } = await supabase
                .rpc('get_game_events', { p_game_id: gameId });
                
              if (eventsError) {
                console.error("Error fetching game events:", eventsError);
                continue;
              }
                
              if (events && events.length > 0) {
                console.log(`Processing ${events.length} events for ${players.length} players`);
                
                for (const player of players) {
                  console.log(`Processing events for player: ${player.name} (${player.id})`);
                  
                  try {
                    const success = await processEventsToStats(player.id);
                    if (success) {
                      console.log(`Successfully processed events for player ${player.name}`);
                      successCount++;
                    } else {
                      console.warn(`No events processed for player ${player.name}`);
                    }
                  } catch (processError) {
                    console.error(`Error processing events for player ${player.name}:`, processError);
                  }
                }
              } else {
                console.log("No events found for this game");
              }
            } else {
              console.log("No players found for team", teamId);
            }
          }
          
          toast.dismiss();
          if (successCount > 0) {
            toast.success(`Game stats have been processed for ${successCount} of ${playerCount} players`);
          } else {
            toast.warning("No player stats were processed. Check the events data.");
          }
        } else {
          toast.error("Could not process game stats: Game data not found");
        }
      } catch (processError) {
        console.error("Error processing game stats on end:", processError);
        toast.error("Failed to process game stats");
      } finally {
        setIsProcessingStats(false);
      }
      
    } catch (error) {
      console.error("Error stopping game:", error);
      toast.error("Failed to stop game");
      setIsProcessingStats(false);
    }
  }, [gameId]);
  
  const handleStoppage = useCallback(() => {
    setStopReason('stoppage');
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
    handleStoppage,
    isProcessingStats
  };
}
