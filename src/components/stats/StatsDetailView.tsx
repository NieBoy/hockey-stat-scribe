import React from "react";
import { PlayerStat, StatType } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsDetailViewProps {
  stats: PlayerStat[];
}

const StatsDetailView: React.FC<StatsDetailViewProps> = ({ stats }) => {
  // Group stats by category using only valid StatTypes
  const offensiveStats = stats.filter(s => 
    ['goals', 'assists'].includes(s.statType || s.stat_type)
  );
  
  const defensiveStats = stats.filter(s => 
    ['plusMinus', 'hits'].includes(s.statType || s.stat_type)
  );
  
  // Filter for special teams - we'll keep this simpler for now
  // Note: We're not using powerPlayGoals etc. since they're not in the StatType
  const specialTeamsStats: PlayerStat[] = [];
  
  // Filter for faceoffs
  const faceoffStats = stats.filter(s => 
    ['faceoffs'].includes(s.statType || s.stat_type)
  );

  // Add other stats that don't fit in the categories above
  const otherStats = stats.filter(s =>
    ['penalties', 'saves'].includes(s.statType || s.stat_type)
  );

  const formatStatType = (type: string): string => {
    switch(type) {
      case 'goals': return 'Goals';
      case 'assists': return 'Assists';
      case 'plusMinus': return 'Plus/Minus';
      case 'hits': return 'Hits';
      case 'penalties': return 'Penalties';
      case 'faceoffs': return 'Faceoffs';
      case 'saves': return 'Saves';
      default: return type;
    }
  };

  // Format the value for display, specifically for plus/minus
  const formatStatValue = (type: string, value: number): string => {
    if (type === 'plusMinus') {
      return value > 0 ? `+${value}` : `${value}`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-8">
      {offensiveStats.length > 0 && (
        <StatCategoryCard 
          title="Offensive Stats" 
          description="Goals and assists" 
          stats={offensiveStats} 
          formatStatType={formatStatType} 
          formatStatValue={formatStatValue}
        />
      )}
      
      {defensiveStats.length > 0 && (
        <StatCategoryCard 
          title="Defensive Stats" 
          description="Plus/minus and hits" 
          stats={defensiveStats} 
          formatStatType={formatStatType}
          formatStatValue={formatStatValue}
        />
      )}
      
      {specialTeamsStats.length > 0 && (
        <StatCategoryCard 
          title="Special Teams" 
          description="Power play and penalty kill statistics" 
          stats={specialTeamsStats} 
          formatStatType={formatStatType}
          formatStatValue={formatStatValue}
        />
      )}
      
      {faceoffStats.length > 0 && (
        <StatCategoryCard 
          title="Faceoffs" 
          description="Faceoff statistics" 
          stats={faceoffStats} 
          formatStatType={formatStatType}
          formatStatValue={formatStatValue}
        />
      )}

      {otherStats.length > 0 && (
        <StatCategoryCard 
          title="Other Stats" 
          description="Penalties, saves, and other statistics" 
          stats={otherStats} 
          formatStatType={formatStatType}
          formatStatValue={formatStatValue}
        />
      )}
    </div>
  );
};

interface StatCategoryCardProps {
  title: string;
  description: string;
  stats: PlayerStat[];
  formatStatType: (type: string) => string;
  formatStatValue: (type: string, value: number) => string;
}

const StatCategoryCard: React.FC<StatCategoryCardProps> = ({ 
  title, 
  description, 
  stats,
  formatStatType,
  formatStatValue
}) => {
  if (stats.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Stat</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Games</TableHead>
              <TableHead className="text-right">Per Game</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.map(stat => {
              const statType = stat.statType || stat.stat_type;
              const gamesPlayed = stat.gamesPlayed || stat.games_played;
              const perGame = gamesPlayed > 0 
                ? (stat.value / gamesPlayed) 
                : 0;
                
              // For plus/minus, we want to show the sign for the per-game value too
              const formattedPerGame = statType === 'plusMinus' && perGame !== 0
                ? (perGame > 0 ? `+${perGame.toFixed(2)}` : perGame.toFixed(2))
                : perGame.toFixed(2);
              
              return (
                <TableRow key={statType}>
                  <TableCell>{formatStatType(statType)}</TableCell>
                  <TableCell 
                    className={`text-right ${statType === 'plusMinus' ? (stat.value > 0 ? 'text-green-600' : stat.value < 0 ? 'text-red-600' : '') : ''}`}
                  >
                    {formatStatValue(statType, stat.value)}
                  </TableCell>
                  <TableCell className="text-right">{gamesPlayed}</TableCell>
                  <TableCell 
                    className={`text-right ${statType === 'plusMinus' ? (perGame > 0 ? 'text-green-600' : perGame < 0 ? 'text-red-600' : '') : ''}`}
                  >
                    {formattedPerGame}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StatsDetailView;
