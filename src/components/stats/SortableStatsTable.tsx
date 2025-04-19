
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
import { PlayerStat } from "@/types";

type SortDirection = "asc" | "desc" | null;
type SortField = "name" | "value" | "gamesPlayed" | "average";

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
        case "average":
          aValue = a.value / a.gamesPlayed;
          bValue = b.value / b.gamesPlayed;
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
                onClick={() => handleSort("name")}
                className="h-8 flex items-center gap-1"
              >
                Player {getSortIcon("name")}
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
                No stats available
              </TableCell>
            </TableRow>
          ) : (
            sortedStats.map((stat) => (
              <TableRow key={`${stat.playerId}-${stat.statType}`}>
                <TableCell>{getPlayerName(stat.playerId)}</TableCell>
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
