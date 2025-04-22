
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Table, TableHead, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import NewOpponentGameDialog from "./NewOpponentGameDialog";
import { supabase } from "@/lib/supabase";
import { Team } from "@/types";
import { format } from "date-fns";

interface TeamScheduleTabContentProps {
  team: Team;
}

type GameScheduleItem = {
  id: string;
  date: string;
  location: string;
  opponent: string;
};

export default function TeamScheduleTabContent({ team }: TeamScheduleTabContentProps) {
  const [games, setGames] = useState<GameScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-fetch

  // Fetch games for this team whenever dialogOpen changes or refreshKey changes
  useEffect(() => {
    let cancelled = false;

    async function fetchGames() {
      setLoading(true);

      try {
        // Query games where team is home or away and include opponent_name
        let { data, error } = await supabase
          .from('games')
          .select(`
            id,
            date,
            location,
            home_team_id,
            away_team_id,
            opponent_name
          `)
          .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`);

        if (cancelled) return;

        if (error) {
          console.error("Error fetching games:", error);
          setGames([]);
          setLoading(false);
          return;
        }

        // Compose a readable 'opponent' label per game
        const asSchedule = (data || []).map((g: any) => {
          let opponent: string = '';

          if (g.opponent_name) {
            opponent = g.opponent_name;
          } else if (g.home_team_id === team.id && g.away_team_id !== team.id) {
            opponent = "[Away Team]";
          } else if (g.away_team_id === team.id && g.home_team_id !== team.id) {
            opponent = "[Home Team]";
          } else {
            opponent = "(Unknown)";
          }

          return {
            id: g.id,
            date: g.date,
            location: g.location,
            opponent,
          };
        });

        setGames(asSchedule);
      } catch (error) {
        console.error("Unexpected error fetching games:", error);
        setGames([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchGames();

    return () => { cancelled = true; };
  }, [team.id, dialogOpen, refreshKey]);

  // Function to handle dialog close and refresh data
  const handleDialogChange = (isOpen: boolean) => {
    setDialogOpen(isOpen);
    if (!isOpen) {
      // Force a refresh when dialog closes (even after adding)
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Schedule</h2>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Game vs Opponent
        </Button>
      </div>
      <NewOpponentGameDialog
        open={dialogOpen}
        setOpen={handleDialogChange}
        teamId={team.id}
        teamName={team.name}
      />
      {loading ? (
        <div className="text-center py-8">Loading schedule…</div>
      ) : games.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No games scheduled.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Opponent</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map(game => (
              <TableRow key={game.id}>
                <TableCell>{format(new Date(game.date), "MMM d, yyyy h:mm a")}</TableCell>
                <TableCell>{game.opponent}</TableCell>
                <TableCell>{game.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
