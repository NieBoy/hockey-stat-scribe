
import { useState, useMemo } from "react";
import { Game, GameStat, StatType } from "@/types";
import { normalizeGameStat } from "@/utils/statNormalizer";

export function useStatsFiltering(stats: GameStat[] | undefined, game: Game) {
  // Filter state
  const [search, setSearch] = useState("");
  const [statTypeFilter, setStatTypeFilter] = useState<StatType | "all">("all");
  const [teamFilter, setTeamFilter] = useState<"all" | "home" | "away">("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  
  const normalizedStats = useMemo(() => {
    if (!stats) return [];
    return stats.map(normalizeGameStat);
  }, [stats]);

  const filteredStats = useMemo(() => {
    if (!normalizedStats) return [];

    return normalizedStats.filter(stat => {
      const player = [...game.homeTeam.players, ...game.awayTeam.players].find(
        p => p.id === stat.player_id
      );
      
      const playerName = player?.name || "";
      const matchesSearch = playerName.toLowerCase().includes(search.toLowerCase());
      const matchesStatType = statTypeFilter === "all" || stat.stat_type === statTypeFilter;
      const matchesPeriod = periodFilter === "all" || stat.period.toString() === periodFilter;
      
      const isHomeTeam = game.homeTeam.players.some(p => p.id === stat.player_id);
      const matchesTeam = teamFilter === "all" || 
        (teamFilter === "home" && isHomeTeam) || 
        (teamFilter === "away" && !isHomeTeam);

      return matchesSearch && matchesStatType && matchesPeriod && matchesTeam;
    });
  }, [normalizedStats, search, statTypeFilter, periodFilter, teamFilter, game]);

  const aggregatedStats = useMemo(() => {
    const playerStats = new Map();

    filteredStats.forEach(stat => {
      const player = [...game.homeTeam.players, ...game.awayTeam.players].find(
        p => p.id === stat.player_id
      );
      
      if (!player) return;

      const isHomeTeam = game.homeTeam.players.some(p => p.id === stat.player_id);
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
      const value = Number(stat.value);

      if (stat.stat_type === "goals") {
        playerStat.goals += value;
      } else if (stat.stat_type === "assists") {
        playerStat.assists += value;
      } else if (stat.stat_type === "plusMinus") {
        // Add the numeric value directly (can be positive or negative)
        playerStat.plusMinus += value;
        console.log(`[Filter] Player ${player.name} plusMinus update: ${value} (total: ${playerStat.plusMinus})`);
      }
    });

    return Array.from(playerStats.values());
  }, [filteredStats, game]);

  return {
    search,
    setSearch,
    statTypeFilter,
    setStatTypeFilter,
    teamFilter,
    setTeamFilter,
    periodFilter,
    setPeriodFilter,
    filteredStats,
    aggregatedStats
  };
}
