
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
  // Define sortable columns
  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "playerName",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Player
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            {formatStatType(type)}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => row.original.stats[type],
    })),
    {
      accessorKey: "gamesPlayed",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="p-0 hover:bg-transparent"
          >
            Games
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
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
