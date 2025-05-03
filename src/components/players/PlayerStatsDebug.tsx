
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { usePlayerStatsData } from "@/hooks/players/usePlayerStatsData";
import { formatDateTime } from "@/lib/date-utils";

interface PlayerStatsDebugProps {
  playerId: string; // This is the team_member.id
}

const PlayerStatsDebug = ({ playerId }: PlayerStatsDebugProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const { 
    stats, 
    rawGameStats, 
    playerGameEvents,
    refetchStats,
    refetchRawStats,
    refetchEvents
  } = usePlayerStatsData(playerId);

  const handleRefreshAll = async () => {
    await Promise.all([
      refetchStats(),
      refetchRawStats(),
      refetchEvents()
    ]);
  };

  // Format the display of stat values
  const formatStatValue = (statType: string, value: number): string => {
    if (statType === 'plusMinus') {
      return value > 0 ? `+${value}` : `${value}`;
    }
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Player Stats Debug
          <Button 
            onClick={handleRefreshAll} 
            variant="outline" 
            size="sm" 
            className="gap-1"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Aggregated Player Stats</h3>
            {stats && stats.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-1">Stat Type</th>
                    <th className="text-right p-1">Value</th>
                    <th className="text-right p-1">Games</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map(stat => (
                    <tr key={stat.statType} className="border-b border-muted">
                      <td className="p-1">{stat.statType}</td>
                      <td className={`text-right p-1 ${stat.statType === 'plusMinus' ? (stat.value > 0 ? 'text-green-600' : stat.value < 0 ? 'text-red-600' : '') : ''}`}>
                        {formatStatValue(stat.statType, stat.value)}
                      </td>
                      <td className="text-right p-1">{stat.gamesPlayed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground text-sm">No aggregated stats found</p>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Raw Game Stats ({rawGameStats?.length || 0})</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpanded(!expanded)}
              className="mb-1"
            >
              {expanded ? "Collapse" : "Expand"}
            </Button>
            {rawGameStats && rawGameStats.length > 0 ? (
              <div className={`bg-muted p-2 rounded text-xs ${expanded ? "max-h-96" : "max-h-24"} overflow-y-auto`}>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-1">Stat Type</th>
                      <th className="text-right p-1">Value</th>
                      <th className="text-left p-1">Details</th>
                      <th className="text-left p-1">Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawGameStats.map((stat, index) => (
                      <tr key={index} className="border-b border-muted">
                        <td className="p-1">{stat.stat_type}</td>
                        <td className={`text-right p-1 ${stat.stat_type === 'plusMinus' ? (stat.value > 0 ? 'text-green-600' : stat.value < 0 ? 'text-red-600' : '') : ''}`}>
                          {stat.stat_type === 'plusMinus' ? (stat.value > 0 ? `+${stat.value}` : stat.value) : stat.value}
                        </td>
                        <td className="p-1">{stat.details || 'N/A'}</td>
                        <td className="p-1">{stat.period}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No raw game stats found</p>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold mb-1">Game Events ({playerGameEvents?.length || 0})</h3>
            {playerGameEvents && playerGameEvents.length > 0 ? (
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left p-1">Time</th>
                      <th className="text-left p-1">Type</th>
                      <th className="text-left p-1">Period</th>
                      <th className="text-left p-1">Team</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerGameEvents.map((event: any) => (
                      <tr key={event.id} className="border-b border-muted">
                        <td className="p-1">{formatDateTime(new Date(event.timestamp))}</td>
                        <td className="p-1">{event.event_type}</td>
                        <td className="p-1">{event.period}</td>
                        <td className="p-1">{event.team_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No game events found</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsDebug;
