
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatType } from "@/types";
import { formatStatType } from "@/components/stats/StatsContent";
import { Link } from "react-router-dom";

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
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Player</TableHead>
            {statTypes.map((type) => (
              <TableHead key={type} className="text-center">
                {formatStatType(type)}
              </TableHead>
            ))}
            <TableHead className="text-center">Games</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.map((player) => (
            <TableRow key={player.playerId}>
              <TableCell className="font-medium">
                <Link 
                  to={`/players/${player.playerId}/stats`}
                  className="text-primary hover:underline"
                >
                  {player.playerName}
                </Link>
              </TableCell>
              {statTypes.map((type) => (
                <TableCell key={type} className="text-center">
                  {player.stats[type]}
                </TableCell>
              ))}
              <TableCell className="text-center">{player.gamesPlayed}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
