
import { useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import EventTracker from "@/components/events/EventTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGameById } from "@/services/games";
import { supabase } from "@/lib/supabase";

export default function GameTracking() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: game, isLoading } = useQuery({
    queryKey: ['games', id],
    queryFn: () => getGameById(id),
    enabled: !!id
  });

  useEffect(() => {
    // Subscribe to real-time game updates
    const channel = supabase
      .channel('game_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${id}`
        },
        () => {
          // Refetch game data when changes occur
          queryClient.invalidateQueries({ queryKey: ['games', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!game) {
    return (
      <MainLayout>
        <div className="text-center">
          <h2 className="text-2xl font-bold">Game not found</h2>
          <Button asChild className="mt-4">
            <Link to="/games">Return to Games</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Make sure homeTeam and awayTeam both exist before trying to access their properties
  const homeTeamName = game.homeTeam?.name || 'Home Team';
  const awayTeamName = game.awayTeam?.name || 'Away Team';

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-1 mb-4" asChild>
          <Link to={`/games/${id}`}>
            <ArrowLeft className="h-4 w-4" /> Back to Game
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Track Game Events</h1>
            <p className="text-muted-foreground">
              {homeTeamName} vs {awayTeamName}
            </p>
          </div>
        </div>
      </div>

      <EventTracker />
    </MainLayout>
  );
}
