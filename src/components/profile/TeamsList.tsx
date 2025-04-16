
import { Link } from "react-router-dom";
import { Team } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, User } from "lucide-react";

interface TeamsListProps {
  teams: Team[];
  isAdmin?: boolean;
}

export default function TeamsList({ teams, isAdmin = false }: TeamsListProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Teams</h2>
        {isAdmin && (
          <Button asChild>
            <Link to="/teams/new">
              <Plus className="mr-2 h-4 w-4" /> Add Team
            </Link>
          </Button>
        )}
      </div>
      
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader className="pb-2">
                <CardTitle>{team.name}</CardTitle>
                <CardDescription>
                  {team.organizationId ? `Organization ID: ${team.organizationId}` : 'No organization'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{team.players.length} Players</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{team.coaches.length} Coaches</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
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
              You are not associated with any teams yet.
            </p>
            {isAdmin && (
              <Button className="mt-4" asChild>
                <Link to="/teams/new">
                  <Plus className="mr-2 h-4 w-4" /> Create a team
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
