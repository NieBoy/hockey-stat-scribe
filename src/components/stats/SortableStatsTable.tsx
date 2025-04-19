
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowDown, ArrowUp } from "lucide-react";
import { PlayerStat, StatType } from "@/types";
import { Badge } from "@/components/ui/badge";

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "value" | "gamesPlayed" | "average" | "statType";

// Helper function to make stat types more readable
const formatStatType = (statType: StatType): string => {
  switch(statType) {
    case 'goals': return 'Goals';
    case 'assists': return 'Assists';
    case 'faceoffs': return 'Faceoffs';
    case 'hits': return 'Hits';
    case 'penalties': return 'Penalties';
    case 'saves': return 'Saves';
    case 'plusMinus': return 'Plus/Minus';
    default: return statType;
  }
};

// Helper to get stat color based on the statType
const getStatTypeColor = (statType: StatType): string => {
  switch(statType) {
    case 'goals': return 'bg-red-100 text-red-800';
    case 'assists': return 'bg-blue-100 text-blue-800';
    case 'faceoffs': return 'bg-amber-100 text-amber-800';
    case 'hits': return 'bg-purple-100 text-purple-800';
    case 'penalties': return 'bg-orange-100 text-orange-800';
    case 'saves': return 'bg-green-100 text-green-800';
    case 'plusMinus': return 'bg-sky-100 text-sky-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

interface SortableStatsTableProps {
  stats: PlayerStat[];
  getPlayerName: (playerId: string) => string;
}

export function SortableStatsTable({ stats, getPlayerName }: SortableStatsTableProps) {
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => {
        if (prev === "asc") return "desc";
        if (prev === "desc") return null;
        return "asc";
      });
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortedStats = () => {
    if (!sortDirection) return stats;

    return [...stats].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "name":
          aValue = getPlayerName(a.playerId).toLowerCase();
          bValue = getPlayerName(b.playerId).toLowerCase();
          break;
        case "statType":
          aValue = a.statType;
          bValue = b.statType;
          break;
        case "average":
          aValue = a.gamesPlayed > 0 ? a.value / a.gamesPlayed : 0;
          bValue = b.gamesPlayed > 0 ? b.value / b.gamesPlayed : 0;
          break;
        default:
          aValue = a[sortField];
          bValue = b[sortField];
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === "asc") return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === "desc") return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const sortedStats = getSortedStats();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("statType")}
                className="h-8 flex items-center gap-1"
              >
                Stat Type {getSortIcon("statType")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("value")}
                className="h-8 flex items-center gap-1"
              >
                Total {getSortIcon("value")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("gamesPlayed")}
                className="h-8 flex items-center gap-1"
              >
                Games {getSortIcon("gamesPlayed")}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("average")}
                className="h-8 flex items-center gap-1"
              >
                Average {getSortIcon("average")}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStats.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No stats available for this player
              </TableCell>
            </TableRow>
          ) : (
            sortedStats.map((stat) => (
              <TableRow key={`${stat.playerId}-${stat.statType}`}>
                <TableCell>
                  <Badge className={getStatTypeColor(stat.statType)}>
                    {formatStatType(stat.statType)}
                  </Badge>
                </TableCell>
                <TableCell>{stat.value}</TableCell>
                <TableCell>{stat.gamesPlayed}</TableCell>
                <TableCell>
                  {stat.gamesPlayed > 0
                    ? (stat.value / stat.gamesPlayed).toFixed(2)
                    : "0.00"}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
