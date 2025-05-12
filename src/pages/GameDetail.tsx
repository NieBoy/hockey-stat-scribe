
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/ui/loading-spinner";
import GameDetailHeader from "@/components/game-detail/GameDetailHeader";
import GameDetailTabs from "@/components/game-detail/GameDetailTabs";
import GameDetailError from "@/components/game-detail/GameDetailError";
import { useGameDetail } from "@/hooks/useGameDetail";

export default function GameDetail() {
  const navigate = useNavigate();
  const {
    gameId,
    gameData,
    isLoading,
    error,
    currentPeriod,
    isActive,
    gameStatus,
    isTracker,
    statTypes,
    events,
    gameStats,
    handleGoBack,
    handlePeriodChange,
    handleToggleGameStatus,
    handleStartGame,
    handleStopGame,
    handleEndPeriod,
    addEvent,
    handleStatRecorded,
    handleStatDeleted,
  } = useGameDetail();

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show error state if game not found
  if (!gameData) {
    return <GameDetailError onBack={() => navigate("/games")} />;
  }

  return (
    <div className="container py-6">
      <GameDetailHeader
        gameData={gameData}
        currentPeriod={currentPeriod}
        isActive={isActive}
        gameStatus={gameStatus}
        gameId={gameId}
        handleGoBack={handleGoBack}
        handlePeriodChange={handlePeriodChange}
        handleToggleGameStatus={handleToggleGameStatus}
        handleStartGame={handleStartGame}
        handleStopGame={handleStopGame}
        handleEndPeriod={handleEndPeriod}
      />

      <GameDetailTabs
        gameId={gameId}
        gameData={gameData}
        isTracker={isTracker}
        statTypes={statTypes}
        events={events}
        gameStats={gameStats}
        currentPeriod={currentPeriod}
        addEvent={addEvent}
        handleStatRecorded={handleStatRecorded}
        handleStatDeleted={handleStatDeleted}
      />
    </div>
  );
}
