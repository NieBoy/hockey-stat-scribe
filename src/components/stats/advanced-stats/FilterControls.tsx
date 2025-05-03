
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Game, StatType } from "@/types";

interface FilterControlsProps {
  search: string;
  setSearch: (value: string) => void;
  statTypeFilter: StatType | "all";
  setStatTypeFilter: (value: StatType | "all") => void;
  teamFilter: "all" | "home" | "away";
  setTeamFilter: (value: "all" | "home" | "away") => void;
  periodFilter: string;
  setPeriodFilter: (value: string) => void;
  game: Game;
}

export default function FilterControls({
  search,
  setSearch,
  statTypeFilter,
  setStatTypeFilter,
  teamFilter,
  setTeamFilter,
  periodFilter,
  setPeriodFilter,
  game
}: FilterControlsProps) {
  return (
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
  );
}
