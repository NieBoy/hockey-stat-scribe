
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Game } from '@/types';

interface GameScoreDisplayProps {
  gameId: string;
  game: Game;
}

export default function GameScoreDisplay({ gameId, game }: GameScoreDisplayProps) {
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);

  useEffect(() => {
    // Load initial score
    const loadScore = async () => {
      try {
        // Get home team goals
        const { data: homeData, error: homeError } = await supabase
          .from('game_events')
          .select('id')
          .eq('game_id', gameId)
          .eq('event_type', 'goal')
          .eq('team_type', 'home');

        // Get away team goals
        const { data: awayData, error: awayError } = await supabase
          .from('game_events')
          .select('id')
          .eq('game_id', gameId)
          .eq('event_type', 'goal')
          .eq('team_type', 'away');

        if (!homeError && homeData) {
          setHomeGoals(homeData.length);
        }

        if (!awayError && awayData) {
          setAwayGoals(awayData.length);
        }

        if (homeError || awayError) {
          console.error("Error fetching goals:", { homeError, awayError });
        }
      } catch (error) {
        console.error("Error loading game score:", error);
      }
    };

    loadScore();

    // Subscribe to real-time updates for goals
    const channel = supabase
      .channel('game_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_events',
          filter: `game_id=eq.${gameId} AND event_type=eq.goal`,
        },
        () => {
          // Simply reload the score when any goal event changes
          loadScore();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const homeTeamName = game?.homeTeam?.name || 'Home Team';
  const awayTeamName = game?.awayTeam?.name || game?.opponent_name || 'Away Team';

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <div className="font-semibold">{homeTeamName}</div>
            <div className="text-3xl font-bold">{homeGoals}</div>
          </div>
          
          <div className="px-4 text-2xl font-bold text-muted-foreground">vs</div>
          
          <div className="text-center flex-1">
            <div className="font-semibold">{awayTeamName}</div>
            <div className="text-3xl font-bold">{awayGoals}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
