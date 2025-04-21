
import { useEffect } from "react";

// Handles periodic and focus refreshes
export function useTeamRefresh(refetchTeam?: () => void, setLineupRefreshKey?: (fn: (prev: number) => number) => void) {
  useEffect(() => {
    if (refetchTeam) refetchTeam();

    const intervalId = setInterval(() => {
      console.log("TeamDetail - Periodic team data refresh");
      if (refetchTeam) {
        refetchTeam();
        if (setLineupRefreshKey) setLineupRefreshKey(prev => prev + 1);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [refetchTeam, setLineupRefreshKey]);

  useEffect(() => {
    const handleFocus = () => {
      console.log("TeamDetail - Window focused - refreshing team data");
      if (refetchTeam) {
        refetchTeam();
        if (setLineupRefreshKey) setLineupRefreshKey(prev => prev + 1);
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchTeam, setLineupRefreshKey]);
}
