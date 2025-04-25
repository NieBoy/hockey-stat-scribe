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
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 px-2 hover:bg-transparent"
          >
            <span>Player</span>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
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
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 px-2 hover:bg-transparent"
          >
            <span>{formatStatType(type)}</span>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => row.original.stats[type],
    })),
    {
      accessorKey: "gamesPlayed",
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-2 px-2 hover:bg-transparent"
          >
            <span>Games</span>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
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
