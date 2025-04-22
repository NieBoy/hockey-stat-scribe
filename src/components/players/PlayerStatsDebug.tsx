
import { PlayerStat, User } from "@/types";

// Add the SimpleGame interface to match what we're getting from the API
interface SimpleGame {
  id: string;
  date: string;
  home_team_id?: string;
  away_team_id?: string;
  location: string;
}

interface PlayerStatsDebugProps {
  player: User | null;
  playerTeam: any;
  teamGames: SimpleGame[]; // Update to match what we actually receive
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
          <div className="max-h-96 overflow-y-auto"> {/* Increased height for better visibility */}
            {playerGameEvents && playerGameEvents.length > 0 ? (
              playerGameEvents.map((event, index) => (
                <div key={event.id} className="mb-2 border-b border-slate-200 pb-2">
                  <h5 className="text-xs font-semibold bg-blue-50 p-1">Event #{index + 1} ({event.event_type})</h5>
                  <div className="bg-slate-100 p-2 rounded text-xs overflow-auto mt-1">
                    <div>
                      <span className="font-semibold">ID:</span> {event.id}
                    </div>
                    <div>
                      <span className="font-semibold">Game ID:</span> {event.game_id}
                    </div>
                    <div>
                      <span className="font-semibold">Period:</span> {event.period}
                    </div>
                    <div>
                      <span className="font-semibold">Team:</span> {event.team_type}
                    </div>
                    <div>
                      <span className="font-semibold">Time:</span> {new Date(event.timestamp).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-semibold">Details:</span>
                      <pre className="bg-slate-200 p-1 mt-1 rounded-sm">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
                    {/* Add information to help debug player connections */}
                    {event.details && (
                      <div className="mt-2 bg-yellow-50 p-1 rounded">
                        <div className="font-semibold text-yellow-800">Player Match Check:</div>
                        <div className="grid grid-cols-2 gap-1">
                          <div>Scorer Match: </div>
                          <div>{event.details.playerId === player?.id ? '✅ Yes' : '❌ No'}</div>
                          
                          <div>Primary Assist Match: </div>
                          <div>{event.details.primaryAssistId === player?.id ? '✅ Yes' : '❌ No'}</div>
                          
                          <div>Secondary Assist Match: </div>
                          <div>{event.details.secondaryAssistId === player?.id ? '✅ Yes' : '❌ No'}</div>
                          
                          <div>On Ice Match: </div>
                          <div>{event.details.playersOnIce && 
                            (Array.isArray(event.details.playersOnIce) && 
                             event.details.playersOnIce.includes(player?.id)) ? '✅ Yes' : '❌ No'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-amber-50 p-2 rounded text-amber-800 text-xs">
                No game events found for this player. 
                <div className="mt-1 font-semibold">Debug info:</div>
                <div>Player ID: {player?.id}</div>
                <div>Query used: .or(`details-&gt;&gt;'playerId'.eq.{player?.id},details-&gt;&gt;'primaryAssistId'.eq.{player?.id},details-&gt;&gt;'secondaryAssistId'.eq.{player?.id}`) and .contains('details', {'{'} playersOnIce: [{player?.id}] {'}'})</div>
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
