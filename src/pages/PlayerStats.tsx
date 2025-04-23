
import MainLayout from "@/components/layout/MainLayout";
import PlayerStatsContent from "@/components/players/stats/PlayerStatsContent";
import { useParams } from "react-router-dom";

export default function PlayerStats() {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return (
      <MainLayout>
        <div className="text-center py-20">
          <h1 className="text-3xl font-bold mb-4">Player Not Found</h1>
          <p className="text-muted-foreground">No player ID was provided.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PlayerStatsContent playerId={id} />
    </MainLayout>
  );
}
