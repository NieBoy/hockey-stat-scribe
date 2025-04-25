
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsOverview from "@/components/stats/StatsOverview";
import StatsDetailView from "@/components/stats/StatsDetailView";
import { Button } from "@/components/ui/button";
import { RefreshCw, BadgeInfo } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StatsContentProps {
  stats: any[];
  rawGameStats: any[];
  playerGameEvents: any[];
  teamGames: any[];
  activeTab: string;
  onTabChange: (value: string) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  refreshStatus?: string;
}

export default function StatsContent({
  stats,
  rawGameStats,
  playerGameEvents,
  teamGames,
  activeTab,
  onTabChange,
  isRefreshing = false,
  onRefresh,
  refreshStatus
}: StatsContentProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={onRefresh} 
          disabled={isRefreshing} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Stats"}
        </Button>
      </div>

      {refreshStatus && (
        <Alert variant="default" className="mb-4">
          <BadgeInfo className="h-4 w-4" />
          <AlertDescription>{refreshStatus}</AlertDescription>
        </Alert>
      )}
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="history">Game History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <StatsOverview stats={stats || []} />
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <StatsDetailView stats={stats || []} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <p className="text-muted-foreground">
            Game history coming soon...
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}

