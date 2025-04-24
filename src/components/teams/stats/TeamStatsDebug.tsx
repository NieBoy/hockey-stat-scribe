
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, History } from "lucide-react";
import { Team } from "@/types";

interface TeamStatsDebugProps {
  team: Team;
  refreshStatus: Record<string, string>;
  onReprocessAllStats: () => void;
  isReprocessing: boolean;
  rawGameStats?: any[];
  gameEvents?: any[];
  stats?: any[];
}

export default function TeamStatsDebug({
  team,
  refreshStatus,
  onReprocessAllStats,
  isReprocessing,
  rawGameStats,
  gameEvents,
  stats
}: TeamStatsDebugProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={onReprocessAllStats} 
            variant="outline" 
            size="sm"
            className="gap-2"
            disabled={isReprocessing}
          >
            <History className="h-4 w-4" />
            Reprocess All Stats
          </Button>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Refresh Status by Player</h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(refreshStatus).map(([playerId, status]) => {
              const player = team.players.find(p => p.id === playerId);
              const statusColor = 
                status === "Success" ? "text-green-600" :
                status === "Failed" ? "text-red-600" : "text-yellow-600";
                
              return (
                <div key={playerId} className="text-sm">
                  <span>{player?.name || playerId}: </span>
                  <span className={statusColor}>{status}</span>
                </div>
              );
            })}
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="player-ids">
            <AccordionTrigger>Player IDs ({team.players.length})</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(team.players.map(p => ({ name: p.name, id: p.id })), null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="raw-game-stats">
            <AccordionTrigger>
              Raw Game Stats ({rawGameStats?.length || 0})
            </AccordionTrigger>
            <AccordionContent>
              <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(rawGameStats?.slice(0, 20), null, 2)}
                {rawGameStats && rawGameStats.length > 20 && 
                  `\n... and ${rawGameStats.length - 20} more items`}
              </pre>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="game-events">
            <AccordionTrigger>
              Game Events ({gameEvents?.length || 0})
            </AccordionTrigger>
            <AccordionContent>
              <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(gameEvents?.slice(0, 20), null, 2)}
                {gameEvents && gameEvents.length > 20 && 
                  `\n... and ${gameEvents.length - 20} more items`}
              </pre>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="aggregated-stats">
            <AccordionTrigger>
              Aggregated Stats ({stats?.length || 0})
            </AccordionTrigger>
            <AccordionContent>
              <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-40">
                {JSON.stringify(stats, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
