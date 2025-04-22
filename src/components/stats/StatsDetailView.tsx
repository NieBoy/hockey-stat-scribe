
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
  // Group stats by category
  const offensiveStats = stats.filter(s => 
    ['goals', 'assists', 'shots', 'points'].includes(s.statType)
  );
  
  const defensiveStats = stats.filter(s => 
    ['plusMinus', 'blocks', 'hits'].includes(s.statType)
  );
  
  const specialTeamsStats = stats.filter(s => 
    ['powerPlayGoals', 'powerPlayAssists', 'shorthandedGoals'].includes(s.statType)
  );
  
  const faceoffStats = stats.filter(s => 
    ['faceoffs', 'faceoff_wins', 'faceoff_losses'].includes(s.statType)
  );

  const formatStatType = (type: StatType): string => {
    switch(type) {
      case 'goals': return 'Goals';
      case 'assists': return 'Assists';
      case 'shots': return 'Shots';
      case 'plusMinus': return 'Plus/Minus';
      case 'hits': return 'Hits';
      case 'blocks': return 'Blocked Shots';
      case 'penalties': return 'Penalties';
      case 'faceoffs': return 'Faceoffs';
      case 'faceoff_wins': return 'Faceoff Wins';
      case 'faceoff_losses': return 'Faceoff Losses';
      case 'powerPlayGoals': return 'PP Goals';
      case 'powerPlayAssists': return 'PP Assists';
      case 'shorthandedGoals': return 'SH Goals';
      default: return type;
    }
  };

  return (
    <div className="space-y-8">
      <StatCategoryCard 
        title="Offensive Stats" 
        description="Goals, assists, and shots" 
        stats={offensiveStats} 
        formatStatType={formatStatType} 
      />
      
      <StatCategoryCard 
        title="Defensive Stats" 
        description="Plus/minus, blocks, and hits" 
        stats={defensiveStats} 
        formatStatType={formatStatType} 
      />
      
      {specialTeamsStats.length > 0 && (
        <StatCategoryCard 
          title="Special Teams" 
          description="Power play and penalty kill statistics" 
          stats={specialTeamsStats} 
          formatStatType={formatStatType} 
        />
      )}
      
      {faceoffStats.length > 0 && (
        <StatCategoryCard 
          title="Faceoffs" 
          description="Faceoff statistics" 
          stats={faceoffStats} 
          formatStatType={formatStatType} 
        />
      )}
    </div>
  );
};

interface StatCategoryCardProps {
  title: string;
  description: string;
  stats: PlayerStat[];
  formatStatType: (type: StatType) => string;
}

const StatCategoryCard: React.FC<StatCategoryCardProps> = ({ 
  title, 
  description, 
  stats,
  formatStatType 
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
            {stats.map(stat => (
              <TableRow key={stat.statType}>
                <TableCell>{formatStatType(stat.statType)}</TableCell>
                <TableCell className="text-right">{stat.value}</TableCell>
                <TableCell className="text-right">{stat.gamesPlayed}</TableCell>
                <TableCell className="text-right">
                  {stat.gamesPlayed > 0 
                    ? (stat.value / stat.gamesPlayed).toFixed(2) 
                    : "0.00"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StatsDetailView;
