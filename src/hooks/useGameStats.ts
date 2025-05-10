
import { useState, useEffect } from "react";
import { GameStat } from "@/types";
import { supabase } from "@/lib/supabase";
import { fetchGameStats, insertGameStat, deleteGameStat } from "@/services/stats/gameStatsService";
import { useToast } from "@/hooks/use-toast";

export function useGameStats(gameId: string) {
  const [gameStats, setGameStats] = useState<GameStat[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadGameStats = async () => {
      try {
        const stats = await fetchGameStats(gameId);
        setGameStats(stats);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load game stats",
          variant: "destructive"
        });
      }
    };
    loadGameStats();
  }, [gameId, toast]);

  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel('game_stats_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_stats', 
          filter: `game_id=eq.${gameId}` 
        },
        (payload) => {
          switch(payload.eventType) {
            case 'INSERT':
              const newStat: GameStat = {
                id: payload.new.id,
                game_id: payload.new.game_id,
                player_id: payload.new.player_id,
                stat_type: payload.new.stat_type,
                period: payload.new.period,
                timestamp: payload.new.timestamp,
                value: payload.new.value,
                details: payload.new.details || '',
                // Add alias properties
                gameId: payload.new.game_id,
                playerId: payload.new.player_id,
                statType: payload.new.stat_type
              };
              setGameStats(prev => [...prev, newStat]);
              break;
            case 'DELETE':
              setGameStats(prev => 
                prev.filter(stat => stat.id !== payload.old.id)
              );
              break;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const handleStatRecorded = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
    try {
      await insertGameStat(stat);
      toast({
        title: "Stat Recorded",
        description: "The stat has been successfully recorded."
      });
    } catch (error) {
      console.error("Error recording stat:", error);
      toast({
        title: "Error",
        description: "Failed to record stat",
        variant: "destructive"
      });
    }
  };

  const handleStatDeleted = async (statId: string) => {
    try {
      await deleteGameStat(statId);
      toast({
        title: "Success",
        description: "Stat has been deleted"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete stat",
        variant: "destructive"
      });
    }
  };

  return {
    gameStats,
    handleStatRecorded,
    handleStatDeleted
  };
}
