
import React from "react";
import { Button } from "@/components/ui/button";
import { Team } from "@/types";
import { QuickLineupView } from "./QuickLineupView";

interface QuickLineupSectionProps {
  team: Team;
  lineupRefreshKey: number;
  onEditLineup: () => void;
  onRefreshLineup: () => void;
}

export default function QuickLineupSection({
  team,
  lineupRefreshKey,
  onEditLineup,
  onRefreshLineup
}: QuickLineupSectionProps) {
  return (
    <>
      <QuickLineupView key={`lineup-${lineupRefreshKey}`} team={team} />

      <div className="flex justify-between items-center mb-2">
        <Button variant="outline" onClick={onRefreshLineup}>
          Refresh Lineup
        </Button>
        <Button onClick={onEditLineup}>
          Edit Lineup
        </Button>
      </div>
    </>
  );
}
