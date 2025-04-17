
import { Link } from "react-router-dom";
import { User } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PlayersListProps {
  players: User[];
  isParent?: boolean;
  isCoach?: boolean;
}

export default function PlayersList({ players, isParent = false, isCoach = false }: PlayersListProps) {
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Remove potential duplicates (same player in multiple teams)
  const uniquePlayers = players.reduce((acc: User[], player) => {
    const existingPlayer = acc.find(p => p.id === player.id);
    if (!existingPlayer) {
      acc.push(player);
    } else if (player.teams && player.teams.length > 0) {
      // Merge team information for existing players
      const existingTeams = existingPlayer.teams || [];
      const newTeam = player.teams[0];
      if (!existingTeams.some(t => t.id === newTeam.id)) {
        existingPlayer.teams = [...existingTeams, newTeam];
      }
    }
    return acc;
  }, []);

  console.log("Unique players to display:", uniquePlayers);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {isParent ? "Your Children" : "Players"}
        </h2>
        {isParent && (
          <Button asChild>
            <Link to="/profile/add-child">
              <Plus className="mr-2 h-4 w-4" /> Add Child
            </Link>
          </Button>
        )}
      </div>
      
      {uniquePlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniquePlayers.map((player) => (
            <Card key={player.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>
                      <Link 
                        to={`/players/${player.id}`} 
                        className="hover:underline"
                      >
                        {player.name}
                      </Link>
                    </CardTitle>
                    {player.email && (
                      <CardDescription>
                        {player.email}
                      </CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>
                    <span className="font-medium">Role:</span> Player
                    {player.number && <span className="ml-2">#{player.number}</span>}
                  </div>
                  {player.position && (
                    <div>
                      <span className="font-medium">Position:</span> {player.position}
                    </div>
                  )}
                  {player.teams && player.teams.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="font-medium">Teams:</span>
                      {player.teams.map((team) => (
                        <Badge key={team.id} variant="outline" className="ml-1">
                          <Link to={`/teams/${team.id}`} className="hover:underline">
                            {team.name}
                          </Link>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/players/${player.id}`}>View Stats</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 pb-6 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">
              {isParent ? "No children found" : "No players found"}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isParent 
                ? "You don't have any children linked to your account yet."
                : "No players have been added to your team yet."}
            </p>
            {isParent && (
              <Button className="mt-4" asChild>
                <Link to="/profile/add-child">
                  <Plus className="mr-2 h-4 w-4" /> Add a child
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
