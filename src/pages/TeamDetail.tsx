
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { mockTeams, mockOrganizations } from "@/lib/mock-data";
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
  LineChart
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("players");
  
  const team = mockTeams.find(team => team.id === id);
  const organization = mockOrganizations.find(org => org.id === team?.organizationId);
  
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
              {organization && (
                <Badge variant="outline" className="ml-2">
                  {organization.name}
                </Badge>
              )}
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
            <Button className="gap-2">
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
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getUserInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base font-medium">{player.name}</CardTitle>
                          {player.position && (
                            <div className="text-xs text-muted-foreground">
                              Position: {player.position}
                              {player.lineNumber && ` (Line ${player.lineNumber})`}
                            </div>
                          )}
                        </div>
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
                  <Button className="mt-4">
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
                          <CardTitle className="text-base font-medium">{coach.name}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-2">
                        {coach.email}
                      </div>
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
    </MainLayout>
  );
}
