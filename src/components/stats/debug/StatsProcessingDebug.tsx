
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { refreshPlayerStats } from "@/services/stats/playerStatsService";
import { PlayerStat } from "@/types";
import { RefreshCw, Terminal } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StatsProcessingDebugProps {
  playerId: string;
  onStatsRefreshed?: (stats: PlayerStat[]) => void;
}

const StatsProcessingDebug = ({ playerId, onStatsRefreshed }: StatsProcessingDebugProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [showDebug, setShowDebug] = useState(false);

  const handleRefreshStats = async () => {
    setIsRefreshing(true);
    setDebugLog(["Starting stats refresh process..."]);
    setSuccess(null);
    
    try {
      const result = await refreshPlayerStats(playerId);
      setDebugLog(prev => [...prev, `Stats refresh completed with result: ${result ? 'Success' : 'Failed'}`]);
      setSuccess(result);
      
      if (result && onStatsRefreshed) {
        // If successful and handler provided, call it
        onStatsRefreshed([]);
      }
    } catch (error) {
      console.error("Error refreshing stats:", error);
      setDebugLog(prev => [...prev, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      setSuccess(false);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Only show in development mode or if explicitly enabled
  if (import.meta.env.DEV || showDebug) {
    return (
      <Card className="mt-8">
        <CardHeader className="py-4">
          <CardTitle className="flex items-center text-base">
            <Terminal className="h-4 w-4 mr-2" />
            Stats Processing Debug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefreshStats} 
              disabled={isRefreshing}
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Player Stats
            </Button>
          </div>
          
          {success !== null && (
            <Alert variant={success ? "default" : "destructive"}>
              <AlertDescription>
                {success 
                  ? "Stats successfully refreshed! Reload the page to see changes." 
                  : "Failed to refresh stats. See console for details."}
              </AlertDescription>
            </Alert>
          )}
          
          {debugLog.length > 0 && (
            <Accordion type="single" collapsible>
              <AccordionItem value="logs">
                <AccordionTrigger>Debug Logs</AccordionTrigger>
                <AccordionContent>
                  <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded text-xs overflow-auto max-h-60">
                    {debugLog.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </pre>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardContent>
      </Card>
    );
  }
  
  return null;
};

export default StatsProcessingDebug;
