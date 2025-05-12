
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { Game } from "@/types";
import GameScoreDisplay from "@/components/games/GameScoreDisplay";
import GameStatusControls from "@/components/games/GameStatusControls";

interface GameDetailHeaderProps {
  gameData: Game;
  currentPeriod: number;
  isActive: boolean;
  gameStatus: string;
  gameId?: string;
  handleGoBack: () => void;
  handlePeriodChange: (period: number) => void;
  handleToggleGameStatus: () => Promise<void>;
  handleStartGame: () => Promise<void>;
  handleStopGame: () => Promise<void>;
  handleEndPeriod: () => Promise<void>;
}

export default function GameDetailHeader({
  gameData,
  currentPeriod,
  isActive,
  gameStatus,
  gameId,
  handleGoBack,
  handlePeriodChange,
  handleToggleGameStatus,
  handleStartGame,
  handleStopGame,
  handleEndPeriod,
}: GameDetailHeaderProps) {
  const formattedDate = gameData.date ? format(new Date(gameData.date), "MMMM d, yyyy") : "Unknown date";

  return (
    <div className="mb-6">
      <Button variant="ghost" onClick={handleGoBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Games
      </Button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {gameData.homeTeam?.name} vs {gameData.awayTeam?.name || gameData.opponent_name}
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-1">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {formattedDate}
            </div>
            {gameData.location && (
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {gameData.location}
              </div>
            )}
          </div>
        </div>

        <GameScoreDisplay
          gameId={gameId || ""}
          game={gameData}
        />
      </div>

      <GameStatusControls
        status={gameStatus || 'not-started'}
        period={currentPeriod || 1}
        isActive={isActive}
        currentPeriod={currentPeriod}
        totalPeriods={gameData.periods || 3}
        onPeriodChange={handlePeriodChange}
        onToggleStatus={handleToggleGameStatus}
        onStartGame={handleStartGame}
        onStopGame={handleStopGame}
        onEndPeriod={handleEndPeriod}
      />
    </div>
  );
}
