
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function useLineupRefreshKey(refetchTeam?: () => void) {
  const [lineupRefreshKey, setLineupRefreshKey] = useState<number>(0);

  useEffect(() => {
    // On mount, force immediate refresh based on timestamp
    setLineupRefreshKey(Date.now());
  }, []);

  const handleTeamUpdate = () => {
    console.log("Team update detected, refreshing data");
    if (refetchTeam) {
      refetchTeam();
      setLineupRefreshKey(prev => prev + 1);
    }
  };

  const handleRefreshLineup = () => {
    console.log("TeamDetail - Manual lineup refresh requested");
    if (refetchTeam) {
      refetchTeam();
      setLineupRefreshKey(Date.now());
      toast.success("Refreshing lineup data...");
    }
  };

  return {
    lineupRefreshKey,
    setLineupRefreshKey,
    handleTeamUpdate,
    handleRefreshLineup,
  };
}
