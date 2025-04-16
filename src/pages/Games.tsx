
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { mockGames, currentUser } from "@/lib/mock-data";
import { CalendarIcon, ListFilter, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import GameCard from "@/components/games/GameCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Games() {
  const [filter, setFilter] = useState("all");

  // Filter games based on selection
  const filteredGames = filter === "active" 
    ? mockGames.filter(game => game.isActive) 
    : filter === "upcoming"
    ? mockGames.filter(game => !game.isActive)
    : mockGames;

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Games</h1>
          <p className="text-muted-foreground">
            View and manage scheduled hockey games.
          </p>
        </div>
        {currentUser.role.includes('coach') && (
          <Button asChild className="gap-2">
            <Link to="/games/new">
              <Plus className="h-4 w-4" /> New Game
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <ListFilter className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">Filter:</p>
        </div>
        <Select defaultValue="all" onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Games" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Games</SelectItem>
            <SelectItem value="active">Active Games</SelectItem>
            <SelectItem value="upcoming">Upcoming Games</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No games found</h3>
          <p className="mt-1 text-muted-foreground">
            {filter !== "all" 
              ? "Try changing your filter to see more games." 
              : "Create your first game to get started."}
          </p>
          {currentUser.role.includes('coach') && filter === "all" && (
            <Button className="mt-4" asChild>
              <Link to="/games/new">
                <Plus className="mr-2 h-4 w-4" /> Create New Game
              </Link>
            </Button>
          )}
        </div>
      )}
    </MainLayout>
  );
}
