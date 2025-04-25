
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { StatType } from "@/types";
import { Link } from "react-router-dom";
import { formatStatType } from "@/utils/statsFormatting";

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
      header: "Player",
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
      header: formatStatType(type),
      cell: ({ row }) => row.original.stats[type],
    })),
    {
      accessorKey: "gamesPlayed",
      header: "Games",
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
