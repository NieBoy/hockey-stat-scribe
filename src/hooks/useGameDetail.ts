
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGameById } from "@/services/games";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useGameStats } from "@/hooks/useGameStats";
import { useGameTrackers } from "@/hooks/useGameTrackers";
import { useGameEvents } from "@/hooks/useGameEvents";
import { useGamePeriods } from "@/hooks/useGamePeriods";
import { useGameStatus } from "@/hooks/useGameStatus";
import { useGameScore } from "@/hooks/useGameScore";
import { ensureGameCompatibility } from "@/utils/typeConversions";
import { Game, GameStat, GameEvent } from "@/types";
import { GameStatus } from "@/types/game-control";

export function useGameDetail() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = (path: string) => window.location.href = path;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [statType, setStatType] = useState<"basic" | "advanced">("basic");

  // Fetch game data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["games", gameId],
    queryFn: () => getGameById(gameId || ""),
    enabled: !!gameId,
  });

  // Get game-related hooks
  const { gameStats, handleStatRecorded, handleStatDeleted } = useGameStats(gameId || "");
  const { isTracker, statTypes } = useGameTrackers(gameId || "", user?.id);
  const { events, addEvent } = useGameEvents(gameId || "");
  const { currentPeriod, setCurrentPeriod } = useGamePeriods(data);
  const { isActive, toggleGameStatus, gameStatus } = useGameStatus(gameId || "", data?.is_active);
  const { homeScore, awayScore } = useGameScore(gameId || "");

  // Handler functions
  const handleGoBack = () => {
    navigate("/games");
  };

  const handlePeriodChange = (period: number) => {
    setCurrentPeriod(period);
  };

  const handleToggleGameStatus = async () => {
    const success = await toggleGameStatus();
    if (success) {
      refetch();
    }
  };

  const handleStartGame = async () => {
    const success = await toggleGameStatus();
    if (success) refetch();
  };

  const handleStopGame = async () => {
    const success = await toggleGameStatus();
    if (success) refetch();
  };

  const handleEndPeriod = async () => {
    // This would need actual implementation
    console.log("End period requested");
  };

  // Ensure game data has all required fields
  const gameData = data ? ensureGameCompatibility(data as Game) : null;

  return {
    gameId,
    gameData,
    isLoading,
    error,
    currentPeriod,
    isActive,
    gameStatus: gameStatus as GameStatus, // Explicitly cast to GameStatus
    activeTab,
    statType,
    isTracker,
    statTypes,
    events,
    gameStats,
    homeScore,
    awayScore,
    handleGoBack,
    handlePeriodChange,
    handleToggleGameStatus,
    handleStartGame,
    handleStopGame,
    handleEndPeriod,
    setActiveTab,
    setStatType,
    addEvent,
    handleStatRecorded,
    handleStatDeleted,
    refetch
  };
}
