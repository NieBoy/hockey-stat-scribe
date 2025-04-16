
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mockGames, mockTeams, currentUser } from "@/lib/mock-data";
import { CalendarDays, ClipboardList, Users, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <MainLayout>
      <section className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Hockey Stat Scribe
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Track, analyze, and improve your hockey team's performance with collaborative stat tracking.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <Button size="lg" asChild>
            <Link to="/games">View Games</Link>
          </Button>
          {currentUser.role.includes('coach') && (
            <Button size="lg" variant="outline" asChild>
              <Link to="/games/new">Schedule Game</Link>
            </Button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <CalendarDays className="h-10 w-10 text-primary mb-2" />
              <h2 className="text-xl font-bold">{mockGames.length}</h2>
              <p className="text-muted-foreground">Upcoming Games</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <Users className="h-10 w-10 text-primary mb-2" />
              <h2 className="text-xl font-bold">{mockTeams.length}</h2>
              <p className="text-muted-foreground">Teams</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <ClipboardList className="h-10 w-10 text-primary mb-2" />
              <h2 className="text-xl font-bold">10</h2>
              <p className="text-muted-foreground">Stat Categories</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <h2 className="text-xl font-bold">152</h2>
              <p className="text-muted-foreground">Total Stats</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Recent Games</h2>
            <Button variant="ghost" asChild>
              <Link to="/games">View All</Link>
            </Button>
          </div>
          {mockGames.length > 0 ? (
            <div className="bg-card border rounded-lg divide-y overflow-hidden">
              {mockGames.slice(0, 3).map((game) => (
                <div key={game.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{game.homeTeam.name} vs {game.awayTeam.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(game.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/games/${game.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No games scheduled yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Teams</h2>
            <Button variant="ghost" asChild>
              <Link to="/teams">View All</Link>
            </Button>
          </div>
          {mockTeams.length > 0 ? (
            <div className="bg-card border rounded-lg divide-y overflow-hidden">
              {mockTeams.slice(0, 3).map((team) => (
                <div key={team.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{team.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {team.players.length} Players
                      </p>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/teams/${team.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 text-center">
                <p className="text-muted-foreground">No teams created yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
