
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatType } from "@/types";
import { Link } from "react-router-dom";
import { formatStatType } from "@/utils/statsFormatting";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TeamStatsTableProps {
  stats: {
    playerId: string;
    playerName: string;
    gamesPlayed: number;
    stats: Record<StatType, number>;
  }[];
  statTypes: StatType[];
}

export function TeamStatsTable({ stats, statTypes }: TeamStatsTableProps) {
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "playerName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full text-left font-medium text-muted-foreground hover:bg-transparent"
        >
          <div className="flex items-center justify-between w-full">
            Player
            <ArrowUpDown className="h-4 w-4 ml-2" />
          </div>
        </Button>
      ),
      cell: ({ row }) => (
        <Link 
          to={`/players/${row.original.playerId}/stats`}
          className="text-primary hover:underline"
        >
          {row.getValue("playerName")}
        </Link>
      ),
    },
    ...statTypes.map((type) => ({
      accessorKey: `stats.${type}`,
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full text-left font-medium text-muted-foreground hover:bg-transparent"
        >
          <div className="flex items-center justify-between w-full">
            {formatStatType(type)}
            <ArrowUpDown className="h-4 w-4 ml-2" />
          </div>
        </Button>
      ),
      cell: ({ row }) => row.original.stats[type],
    })),
    {
      accessorKey: "gamesPlayed",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="w-full text-left font-medium text-muted-foreground hover:bg-transparent"
        >
          <div className="flex items-center justify-between w-full">
            Games
            <ArrowUpDown className="h-4 w-4 ml-2" />
          </div>
        </Button>
      ),
    },
  ];

  return (
    <DataTable 
      columns={columns}
      data={stats}
      filterColumn="playerName"
      filterPlaceholder="Filter by player name..."
    />
  );
}
