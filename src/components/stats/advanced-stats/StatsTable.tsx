
import { Game } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AggregatedPlayerStat {
  player: any;
  team: string;
  goals: number;
  assists: number;
  plusMinus: number;
}

interface StatsTableProps {
  aggregatedStats: AggregatedPlayerStat[];
}

export default function StatsTable({ aggregatedStats }: StatsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Player</TableHead>
          <TableHead>Team</TableHead>
          <TableHead className="text-right">Goals</TableHead>
          <TableHead className="text-right">Assists</TableHead>
          <TableHead className="text-right">+/-</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {aggregatedStats.length > 0 ? (
          aggregatedStats.map(({ player, team, goals, assists, plusMinus }) => (
            <TableRow key={player.id}>
              <TableCell>{player.name}</TableCell>
              <TableCell>{team}</TableCell>
              <TableCell className="text-right">{goals}</TableCell>
              <TableCell className="text-right">{assists}</TableCell>
              <TableCell className={`text-right ${plusMinus > 0 ? 'text-green-600' : plusMinus < 0 ? 'text-red-600' : ''}`}>
                {plusMinus > 0 ? `+${plusMinus}` : plusMinus}
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No stats found matching the current filters
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
