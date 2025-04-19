
import { Game, PlayerStat } from "@/types";
import { User } from "@/types";

interface PlayerStatsDebugProps {
  player: User | null;
  playerTeam: any;
  teamGames: any[];
  rawGameStats: any[];
  playerGameEvents: any[];
  stats: PlayerStat[];
}

export default function PlayerStatsDebug({
  player,
  playerTeam,
  teamGames,
  rawGameStats,
  playerGameEvents,
  stats
}: PlayerStatsDebugProps) {
  return (
    <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-md text-left">
      <h3 className="font-medium mb-2 text-lg">Debug Information</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-sm">Player Information:</h4>
          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
            {JSON.stringify(player, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium text-sm">Player Team:</h4>
          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
            {JSON.stringify(playerTeam, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium text-sm">Team Games:</h4>
          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
            {JSON.stringify(teamGames, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium text-sm">Player Game Events:</h4>
          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
            {JSON.stringify(playerGameEvents, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium text-sm">Raw Game Stats:</h4>
          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
            {JSON.stringify(rawGameStats, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium text-sm">Processed Stats:</h4>
          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
