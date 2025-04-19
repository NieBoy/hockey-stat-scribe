
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
          <h4 className="font-medium text-sm flex items-center">
            <span>Player Game Events:</span> 
            <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
              {playerGameEvents?.length || 0} events
            </span>
          </h4>
          <div className="max-h-60 overflow-y-auto">
            {playerGameEvents && playerGameEvents.length > 0 ? (
              playerGameEvents.map((event, index) => (
                <div key={event.id} className="mb-2">
                  <h5 className="text-xs font-semibold">Event #{index + 1} ({event.event_type})</h5>
                  <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
                    {JSON.stringify(event, null, 2)}
                  </pre>
                </div>
              ))
            ) : (
              <div className="bg-amber-50 p-2 rounded text-amber-800 text-xs">
                No game events found for this player.
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-sm flex items-center">
            <span>Raw Game Stats:</span>
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {rawGameStats?.length || 0} stats
            </span>
          </h4>
          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1 max-h-60">
            {JSON.stringify(rawGameStats, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium text-sm flex items-center">
            <span>Processed Stats:</span>
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
              {stats?.length || 0} stats
            </span>
          </h4>
          <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
            {JSON.stringify(stats, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
