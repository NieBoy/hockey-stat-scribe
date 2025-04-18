
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ClipboardEdit, BarChart3, UserPlus } from "lucide-react";
import { Game } from "@/types";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getGameById } from "@/services/games";
import LoadingSpinner from "@/components/ui/loading-spinner";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const [isStatTracker, setIsStatTracker] = useState(false);
  const [assignedStatTypes, setAssignedStatTypes] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isCoach = user?.role.includes('coach');
  
  // Use React Query to fetch game data
  const { data: game, isLoading, error } = useQuery({
    queryKey: ['game', id],
    queryFn: () => id ? getGameById(id) : null,
    enabled: !!id
  });
  
  useEffect(() => {
    // Check if current user is assigned as a stat tracker for this game
    const checkStatTrackerStatus = async () => {
      if (!id || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('stat_trackers')
          .select('stat_type')
          .eq('game_id', id)
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error checking stat tracker status:', error);
          return;
        }
        
        const statTypes = data?.map(item => item.stat_type) || [];
        setIsStatTracker(statTypes.length > 0);
        setAssignedStatTypes(statTypes);
        console.log('Stat tracker status:', { isTracker: statTypes.length > 0, statTypes });
      } catch (error) {
        console.error('Error in checkStatTrackerStatus:', error);
      }
    };
    
    checkStatTrackerStatus();
  }, [id, user]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4 flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (error || !game) {
    return (
      <MainLayout>
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <h2 className="text-2xl font-bold">Game not found</h2>
            <p className="text-muted-foreground">
              The game you're looking for doesn't exist or there was an error loading it.
            </p>
            <Button asChild>
              <Link to="/games">Return to Games</Link>
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Now game is definitely defined
  const gameDate = game.date instanceof Date ? game.date : new Date(game.date);

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="mb-6">
          <Button variant="ghost" className="gap-1 mb-4" asChild>
            <Link to="/games">
              <ChevronLeft className="h-4 w-4" /> Back to Games
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Game Details</h1>
              <p className="text-muted-foreground">
                {game.homeTeam.name} vs {game.awayTeam.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="gap-2" asChild>
                <Link to={`/games/${id}/track`}>
                  <ClipboardEdit className="h-4 w-4" /> Track Events
                </Link>
              </Button>
              {isCoach && (
                <Button variant="outline" className="gap-2" asChild>
                  <Link to={`/games/${id}/assign-trackers`}>
                    <UserPlus className="h-4 w-4" /> Assign Stat Trackers
                  </Link>
                </Button>
              )}
              {isStatTracker && (
                <Button variant="secondary" className="gap-2" asChild>
                  <Link to={`/stats/track/${id}`}>
                    <BarChart3 className="h-4 w-4" /> Track Stats
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Game Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Teams</h3>
                <div className="flex justify-between items-center bg-muted/50 p-4 rounded-lg mb-3">
                  <div>
                    <div className="text-xl font-bold">{game.homeTeam.name}</div>
                    <div className="text-muted-foreground">Home Team</div>
                  </div>
                  <div className="text-2xl font-bold">vs</div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{game.awayTeam.name}</div>
                    <div className="text-muted-foreground">Away Team</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{format(gameDate, 'PPP')}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-medium">{format(gameDate, 'p')}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{game.location}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b">
                    <span className="text-muted-foreground">Periods</span>
                    <span className="font-medium">{game.periods}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`font-medium ${game.isActive ? 'text-green-600' : 'text-amber-600'}`}>
                      {game.isActive ? 'Active' : 'Upcoming'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Tabs defaultValue="summary">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Game Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track game events and stats to see a summary here.
                  </p>
                  <div className="mt-4 space-x-2">
                    <Button asChild>
                      <Link to={`/games/${id}/track`}>
                        <ClipboardEdit className="mr-2 h-4 w-4" /> Start Tracking Events
                      </Link>
                    </Button>
                    {isCoach && (
                      <Button variant="outline" asChild>
                        <Link to={`/games/${id}/assign-trackers`}>
                          <UserPlus className="mr-2 h-4 w-4" /> Assign Stat Trackers
                        </Link>
                      </Button>
                    )}
                    {isStatTracker && (
                      <Button variant="secondary" asChild>
                        <Link to={`/stats/track/${id}`}>
                          <BarChart3 className="mr-2 h-4 w-4" /> Track Stats ({assignedStatTypes.join(', ')})
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="events">
              <Card>
                <CardHeader>
                  <CardTitle>Game Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Track goals, penalties, and timeouts during the game.
                  </p>
                  <Button asChild>
                    <Link to={`/games/${id}/track`}>
                      <ClipboardEdit className="mr-2 h-4 w-4" /> Track Events
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>Game Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Track detailed player statistics for this game.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {isStatTracker ? (
                      <Button variant="default" asChild>
                        <Link to={`/stats/track/${id}`}>
                          <BarChart3 className="mr-2 h-4 w-4" /> Track Your Stats ({assignedStatTypes.join(', ')})
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="outline" asChild>
                        <Link to={`/stats/track/${id}`}>
                          <BarChart3 className="mr-2 h-4 w-4" /> View Stats
                        </Link>
                      </Button>
                    )}
                    {isCoach && (
                      <Button variant="outline" asChild>
                        <Link to={`/games/${id}/assign-trackers`}>
                          <UserPlus className="mr-2 h-4 w-4" /> Assign Stat Trackers
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
