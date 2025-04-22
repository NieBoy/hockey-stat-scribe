
import MainLayout from "@/components/layout/MainLayout";

// PHASE 2: Player stats display is removed. Only the Stars leaderboard remains.
// A minimal placeholder is shown pending the new implementation.
export default function PlayerStats() {
  return (
    <MainLayout>
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Player Statistics Unavailable</h1>
        <p className="text-muted-foreground">This player stats page is undergoing a major upgrade.<br /> Please check back soon for a brand new stats experience!</p>
      </div>
    </MainLayout>
  );
}
