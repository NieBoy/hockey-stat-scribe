
// Re-export all stats functionality from the services

import { fetchPlayerStats, fetchAllPlayerStats } from "./core/statsQueries";
import { refreshPlayerStats } from "./core/statsUpdates";
import { refreshAllPlayerStats, reprocessAllStats } from "./core/statsRefresh";

// Player stats
export const getPlayerStats = fetchPlayerStats;
export const getAllPlayerStats = fetchAllPlayerStats;

// Stats refresh
export { refreshPlayerStats, refreshAllPlayerStats, reprocessAllStats };
