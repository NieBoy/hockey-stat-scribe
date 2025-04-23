import { Link } from "react-router-dom";
import { Team } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, User, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface TeamsListProps {
  teams: Team[];
  isAdmin?: boolean;
  onAddTeam?: () => void;
}

export function TeamsList({ teams, isAdmin = false, onAddTeam }: TeamsListProps) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  
  useEffect(() => {
    console.log("TeamsList received teams:", teams?.map(t => ({ id: t.id, name: t.name })));
  }, [teams]);
  
  useEffect(() => {
    refreshTeams();
  }, []);

  const refreshTeams = async () => {
    try {
      setIsRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
      setLastRefreshed(new Date());
    } catch (error) {
      console.error("Failed to refresh teams:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const displayTeams = teams?.filter(Boolean) || [];
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Teams</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={refreshTeams}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {(isAdmin || displayTeams.length > 0) && (
            <Button asChild>
              <Link to="/teams/new">
                <Plus className="mr-2 h-4 w-4" /> Add Team
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {displayTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayTeams.map((team) => (
            <Card key={team.id} className="relative">
              <CardHeader className="pb-2">
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                  {team.players?.length || 0} players, {team.coaches?.length || 0} coaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{team.players?.length || 0} Players</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{team.coaches?.length || 0} Coaches</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/teams/${team.id}`}>View Team</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 pb-6 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No teams found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAdmin ? 'No teams created yet.' : 'You are not associated with any teams yet.'}
            </p>
            <Button className="mt-4" asChild>
              <Link to="/teams/new">
                <Plus className="mr-2 h-4 w-4" /> Create a team
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/teams">View All Teams</Link>
        </Button>
      </div>
    </>
  );
}
