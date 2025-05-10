import { useState, useEffect } from 'react';
import { Team, PlayerStat, StatType } from '@/types';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { normalizePlayerStats } from '@/utils/statNormalizer';

interface StatsTabContentProps {
  team: Team;
}

export default function StatsTabContent({ team }: StatsTabContentProps) {
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!team?.id) return;
      
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('id, player_id, stat_type, value, games_played')
          .eq('team_id', team.id);
          
        if (error) throw error;
        
        // Process the stats with player names
        const playerStats = await Promise.all((data || []).map(async (stat) => {
          // Get player name
          const { data: playerData } = await supabase
            .from('team_members')
            .select('name')
            .eq('id', stat.player_id)
            .single();
            
          return {
            id: stat.id,
            player_id: stat.player_id,
            playerId: stat.player_id,
            stat_type: stat.stat_type,
            statType: stat.stat_type,
            value: stat.value,
            games_played: stat.games_played,
            gamesPlayed: stat.games_played,
            playerName: playerData?.name || 'Unknown Player'
          } as PlayerStat;
        }));
        
        setStats(normalizePlayerStats(playerStats));
      } catch (error) {
        console.error('Error fetching player stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [team.id]);
  
  return (
    <Card>
      <CardContent>
        {loading ? (
          <p>Loading stats...</p>
        ) : (
          <div>
            {stats.length > 0 ? (
              <ul>
                {stats.map((stat) => (
                  <li key={stat.id}>
                    {stat.playerName}: {stat.statType} - {stat.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No stats available for this team.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
