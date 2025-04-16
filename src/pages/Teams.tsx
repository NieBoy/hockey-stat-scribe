
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { mockTeams, currentUser } from "@/lib/mock-data";

export default function Teams() {
  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Teams</h1>
          <p className="text-muted-foreground">
            View and manage hockey teams.
          </p>
        </div>
        {currentUser.role.includes('coach') && (
          <Button asChild className="gap-2">
            <Link to="/teams/new">
              <Plus className="h-4 w-4" /> New Team
            </Link>
          </Button>
        )}
      </div>

      {mockTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Users className="h-4 w-4" />
                  <span>{team.players.length} Players</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Roster:</h3>
                  <div className="flex flex-wrap gap-2">
                    {team.players.slice(0, 3).map((player) => (
                      <div key={player.id} className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-sm">
                        <User className="h-3 w-3" />
                        {player.name}
                      </div>
                    ))}
                    {team.players.length > 3 && (
                      <div className="bg-muted/50 px-2 py-1 rounded-md text-sm">
                        +{team.players.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/teams/${team.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No teams yet</h3>
          <p className="mt-1 text-muted-foreground">
            Create your first team to get started
          </p>
          {currentUser.role.includes('coach') && (
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Create New Team
            </Button>
          )}
        </div>
      )}
    </MainLayout>
  );
}
