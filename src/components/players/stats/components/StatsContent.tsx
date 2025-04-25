
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsOverview from "@/components/stats/StatsOverview";
import StatsDetailView from "@/components/stats/StatsDetailView";
import GameStatsView from "@/components/stats/GameStatsView";

interface StatsContentProps {
  stats: any[];
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
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="games">Game Stats</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="mt-4">
        <StatsOverview stats={stats} />
      </TabsContent>
      <TabsContent value="details" className="mt-4">
        <StatsDetailView stats={stats} />
      </TabsContent>
      <TabsContent value="games" className="mt-4">
        <GameStatsView 
          gameStats={rawGameStats} 
          gameEvents={playerGameEvents}
          games={teamGames} 
        />
      </TabsContent>
    </Tabs>
  );
}
