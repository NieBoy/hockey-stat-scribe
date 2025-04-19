
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PlayerStat } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface StatsContentProps {
  stats: PlayerStat[];
}

export default function StatsContent({ stats }: StatsContentProps) {
  const columns: ColumnDef<PlayerStat>[] = [
    {
      accessorKey: "playerId",
      header: "Player",
      cell: ({ row }) => {
        const playerId = row.original.playerId;
        const playerName = row.original.playerName || 'Unknown Player';
        return <Link to={`/players/${playerId}/stats`} className="text-primary hover:underline">{playerName}</Link>;
      },
    },
    {
      accessorKey: "statType",
      header: "Stat Type",
      cell: ({ row }) => (
        <Badge className={getStatTypeColor(row.original.statType)}>
          {formatStatType(row.original.statType)}
        </Badge>
      ),
    },
    {
      accessorKey: "value",
      header: "Total",
    },
    {
      accessorKey: "gamesPlayed",
      header: "Games",
    },
    {
      accessorKey: "average",
      header: "Average",
      cell: ({ row }) => {
        const average = row.original.gamesPlayed > 0 
          ? (row.original.value / row.original.gamesPlayed).toFixed(2) 
          : "0.00";
        return average;
      },
    },
  ];

  return (
    <Card>
      <DataTable
        columns={columns}
        data={stats}
        searchKey="playerName"
      />
    </Card>
  );
}

// Helper function to make stat types more readable
const formatStatType = (statType: string): string => {
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
const getStatTypeColor = (statType: string): string => {
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
