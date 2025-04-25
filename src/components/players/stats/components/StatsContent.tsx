
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsOverview from "@/components/stats/StatsOverview";
import StatsDetailView from "@/components/stats/StatsDetailView";
import { PlayerStat } from "@/types";

interface StatsContentProps {
  stats: PlayerStat[];
  rawGameStats: any[];
  playerGameEvents: any[];
  teamGames: any[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function StatsContent({
  stats,
  rawGameStats,
  playerGameEvents,
  teamGames,
  activeTab,
  onTabChange
}: StatsContentProps) {
  // Always render tabs, even if no stats
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mt-6">
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
  );
}
