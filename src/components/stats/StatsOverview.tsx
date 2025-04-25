
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PlayerStat } from "@/types";

interface StatsOverviewProps {
  stats: PlayerStat[];
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  console.log("Rendering StatsOverview with stats:", stats);
  
  // Calculate key statistics with safe defaults
  const goals = stats?.find(s => s.statType === 'goals')?.value || 0;
  const assists = stats?.find(s => s.statType === 'assists')?.value || 0;
  const points = goals + assists;
  
  const plusMinus = stats?.find(s => s.statType === 'plusMinus')?.value || 0;
  const games = stats && stats.length > 0 ? stats[0]?.gamesPlayed || 0 : 0;
  
  // If there are no stats at all, show a message
  if (!stats || stats.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No statistics available for this player.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Statistics will appear after this player participates in games.
        </p>
      </div>
    );
  }
  
  const statsCards = [
    { label: "Games", value: games },
    { label: "Goals", value: goals },
    { label: "Assists", value: assists },
    { label: "Points", value: points },
    { label: "Plus/Minus", value: plusMinus >= 0 ? `+${plusMinus}` : plusMinus }
  ];
  
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Per Game Averages</h3>
        {games > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Goals/Game</p>
              <p className="text-xl font-semibold">{(goals / games).toFixed(2)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Assists/Game</p>
              <p className="text-xl font-semibold">{(assists / games).toFixed(2)}</p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground">Points/Game</p>
              <p className="text-xl font-semibold">{(points / games).toFixed(2)}</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No games played yet
          </p>
        )}
      </div>
    </div>
  );
};

export default StatsOverview;
