
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  User, 
  UserCog,
  PanelLeftClose,
  Plus,
  ArrowLeft,
  LineChart,
  X
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTeams } from "@/hooks/useTeams";
import { useQuery } from "@tanstack/react-query";
import { getTeamById } from "@/services/teams";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";

export default function TeamDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("players");
  
  const { 
    addPlayerDialogOpen, 
    setAddPlayerDialogOpen, 
    newPlayer,
    setNewPlayer,
    handleAddPlayer,
    submitNewPlayer,
    selectedTeam,
    handleRemovePlayer
  } = useTeams();

  const { 
    data: team, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['team', id],
    queryFn: () => getTeamById(id),
    enabled: !!id,
    staleTime: 10000,
  });
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Error Loading Team</h1>
          <p className="text-red-500">{(error as Error).message}</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Team Not Found</h1>
          <p>The team you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2" 
          onClick={() => navigate("/teams")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Teams
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {team.players.length} players • {team.coaches.length} coaches
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" asChild>
              <Link to={`/teams/${id}/lineup`}>
                <PanelLeftClose className="h-4 w-4" />
                Lineup Editor
              </Link>
            </Button>
            <Button className="gap-2" onClick={() => handleAddPlayer(team.id)}>
              <Plus className="h-4 w-4" />
              Add Player
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="players" className="space-y-4">
            {team.players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.players.map(player => (
                  <Card key={player.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getUserInitials(player.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base font-medium">
                              <Link 
                                to={`/players/${player.id}`} 
                                className="hover:underline"
                              >
                                {player.name}
                              </Link>
                            </CardTitle>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              {player.number && <span>#{player.number}</span>}
                              {player.position && (
                                <>
                                  {player.number && <span>•</span>}
                                  <span>{player.position}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleRemovePlayer(team.id, player.id, player.name)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove player</span>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {player.email && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {player.email}
                        </div>
                      )}
                      <div className="flex mt-2 gap-2">
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <Link to={`/players/${player.id}/stats`}>
                            <LineChart className="h-3 w-3" /> Stats
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="pt-6 pb-6 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No players found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This team doesn't have any players yet.
                  </p>
                  <Button className="mt-4" onClick={() => handleAddPlayer(team.id)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Player
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="coaches" className="space-y-4">
            {team.coaches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.coaches.map(coach => (
                  <Card key={coach.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getUserInitials(coach.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base font-medium">
                            <Link 
                              to={`/players/${coach.id}`} 
                              className="hover:underline"
                            >
                              {coach.name}
                            </Link>
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {coach.email && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {coach.email}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="pt-6 pb-6 text-center">
                  <UserCog className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No coaches found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This team doesn't have any coaches yet.
                  </p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Add Coach
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="text-center py-10">
              <LineChart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Team stats coming soon</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                This feature is still under development. Check back soon to view team statistics.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Player Dialog */}
      <AddPlayerDialog
        isOpen={addPlayerDialogOpen}
        onOpenChange={setAddPlayerDialogOpen}
        selectedTeam={selectedTeam}
        onSubmit={submitNewPlayer}
        newPlayer={newPlayer}
        setNewPlayer={setNewPlayer}
      />
    </MainLayout>
  );
}
