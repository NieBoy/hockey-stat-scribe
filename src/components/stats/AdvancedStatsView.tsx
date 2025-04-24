
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchGameStats } from "@/services/stats/gameStatsService";
import { Game, GameStat, StatType } from "@/types";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useStatsDebugData } from "@/hooks/stats/useStatsDebugData";
import StatsDebugPanel from "./debug/StatsDebugPanel";

interface AdvancedStatsViewProps {
  game: Game;
}

export default function AdvancedStatsView({ game }: AdvancedStatsViewProps) {
  const [search, setSearch] = useState("");
  const [statTypeFilter, setStatTypeFilter] = useState<StatType | "all">("all");
  const [teamFilter, setTeamFilter] = useState<"all" | "home" | "away">("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [showDebug, setShowDebug] = useState(false);
  
  // Fetch game stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ['gameStats', game.id],
    queryFn: () => fetchGameStats(game.id),
  });

  // Fetch debug information
  const { debugData, refetchAll } = useStatsDebugData();

  const filteredStats = useMemo(() => {
    if (!stats) return [];

    return stats.filter(stat => {
      const player = [...game.homeTeam.players, ...game.awayTeam.players].find(
        p => p.id === stat.playerId
      );
      
      const playerName = player?.name || "";
      const matchesSearch = playerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatType = statTypeFilter === "all" || stat.statType === statTypeFilter;
      const matchesPeriod = periodFilter === "all" || stat.period.toString() === periodFilter;
      
      const isHomeTeam = game.homeTeam.players.some(p => p.id === stat.playerId);
      const matchesTeam = teamFilter === "all" || 
        (teamFilter === "home" && isHomeTeam) || 
        (teamFilter === "away" && !isHomeTeam);

      return matchesSearch && matchesStatType && matchesPeriod && matchesTeam;
    });
  }, [stats, search, statTypeFilter, periodFilter, teamFilter, game]);

  const aggregatedStats = useMemo(() => {
    const playerStats = new Map();

    filteredStats.forEach(stat => {
      const player = [...game.homeTeam.players, ...game.awayTeam.players].find(
        p => p.id === stat.playerId
      );
      
      if (!player) return;

      const isHomeTeam = game.homeTeam.players.some(p => p.id === stat.playerId);
      const key = player.id;

      if (!playerStats.has(key)) {
        playerStats.set(key, {
          player,
          team: isHomeTeam ? game.homeTeam.name : game.awayTeam.name,
          goals: 0,
          assists: 0,
          plusMinus: 0
        });
      }

      const playerStat = playerStats.get(key);

      if (stat.statType === "goals") {
        playerStat.goals += stat.value;
      } else if (stat.statType === "assists") {
        playerStat.assists += stat.value;
      } else if (stat.statType === "plusMinus") {
        // Handle plus/minus stats based on the details field
        if (stat.details === "plus") {
          playerStat.plusMinus += stat.value; // Should be +1
        } else if (stat.details === "minus") {
          playerStat.plusMinus -= stat.value; // Should be -1 (but we subtract from the sum)
        }
      }
    });

    return Array.from(playerStats.values());
  }, [filteredStats, game]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Advanced Stats View</CardTitle>
          <div className="flex items-center gap-2">
            <Switch 
              id="show-debug"
              checked={showDebug}
              onCheckedChange={setShowDebug}
            />
            <Label htmlFor="show-debug">Show Debug Panel</Label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search by player name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select value={statTypeFilter} onValueChange={(value: StatType | "all") => setStatTypeFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by stat type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stats</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                  <SelectItem value="assists">Assists</SelectItem>
                  <SelectItem value="plusMinus">Plus/Minus</SelectItem>
                </SelectContent>
              </Select>
              <Select 
                value={teamFilter} 
                onValueChange={(value: "all" | "home" | "away") => setTeamFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Teams</SelectItem>
                  <SelectItem value="home">Home Team</SelectItem>
                  <SelectItem value="away">Away Team</SelectItem>
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  {Array.from({ length: game.periods }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Period {i + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead className="text-right">Goals</TableHead>
                  <TableHead className="text-right">Assists</TableHead>
                  <TableHead className="text-right">+/-</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {aggregatedStats.length > 0 ? (
                  aggregatedStats.map(({ player, team, goals, assists, plusMinus }) => (
                    <TableRow key={player.id}>
                      <TableCell>{player.name}</TableCell>
                      <TableCell>{team}</TableCell>
                      <TableCell className="text-right">{goals}</TableCell>
                      <TableCell className="text-right">{assists}</TableCell>
                      <TableCell className={`text-right ${plusMinus > 0 ? 'text-green-600' : plusMinus < 0 ? 'text-red-600' : ''}`}>
                        {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No stats found matching the current filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {showDebug && (
        <StatsDebugPanel 
          debugData={debugData} 
          stats={filteredStats}
          onRefresh={refetchAll}
        />
      )}
    </>
  );
}
