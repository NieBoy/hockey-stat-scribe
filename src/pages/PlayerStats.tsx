
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User, Position, PlayerStat, StatType } from "@/types";

export default function PlayerStats() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<User | null>(null);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayerAndStats() {
      setLoading(true);
      try {
        // Fetch player details
        const { data: playerData, error: playerError } = await supabase
          .from('team_members')
          .select(`
            id,
            name,
            email,
            role,
            position,
            line_number
          `)
          .eq('id', id)
          .single();
          
        if (playerError) {
          console.error("Error fetching player:", playerError);
          setError("Failed to fetch player details");
          setLoading(false);
          return;
        }
        
        // Fetch player stats
        const { data: statsData, error: statsError } = await supabase
          .from('player_stats')
          .select('*')
          .eq('player_id', id);
          
        if (statsError) {
          console.error("Error fetching stats:", statsError);
          setError("Failed to fetch player stats");
          setLoading(false);
          return;
        }
        
        // Transform to User type
        const playerDetails: User = {
          id: playerData.id,
          name: playerData.name || 'Unknown Player',
          email: playerData.email || undefined,
          role: [playerData.role || 'player'],
          position: playerData.position as Position,
          lineNumber: playerData.line_number,
          number: playerData.line_number ? String(playerData.line_number) : undefined,
        };
        
        // Transform stats
        const playerStats: PlayerStat[] = (statsData || []).map((stat: any) => ({
          playerId: stat.player_id,
          statType: stat.stat_type as StatType,
          value: stat.value,
          gamesPlayed: stat.games_played
        }));
        
        setPlayer(playerDetails);
        setStats(playerStats);
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchPlayerAndStats:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    }

    if (id) {
      fetchPlayerAndStats();
    }
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !player) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Button variant="outline" asChild>
            <Link to="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-500">{error || "Player not found"}</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button variant="outline" asChild className="mb-2">
              <Link to={`/players/${player.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Player
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{player.name}'s Stats</h1>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Season Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="bg-muted/30">
                    <CardContent className="pt-6">
                      <h3 className="font-medium uppercase text-sm text-muted-foreground">
                        {stat.statType}
                      </h3>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Games: {stat.gamesPlayed}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No statistics available for this player yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
