
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getGameById } from '@/services/games';
import { Game, StatType, GameStat } from '@/types';
import StatTracker from '@/components/stats/StatTracker';
import GameStatsList from '@/components/stats/GameStatsList';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { useToast } from "@/hooks/use-toast";
import { useGameStats } from '@/hooks/useGameStats';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ensureGameCompatibility } from '@/utils/typeConversions';

const statTypes: StatType[] = [
  'goals',
  'assists',
  'shots',
  'saves',
  'penalties',
  'faceoffs',
  'blocks',
  'turnovers',
  'plusMinus'
];

export default function TrackStats() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [game, setGame] = useState<Game | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['games', gameId],
    queryFn: () => getGameById(gameId)
  });

  useEffect(() => {
    if (data) {
      // Ensure the game data has the required properties
      const gameData = ensureGameCompatibility(data);
      setGame(gameData);
    }
  }, [data]);

  const { gameStats, handleStatRecorded, handleStatDeleted } = useGameStats(gameId || '');

  const handleStatRecordedWrapper = async (stat: Omit<GameStat, 'id' | 'timestamp'>) => {
    if (!gameId) {
      toast({
        title: "Error",
        description: "Game ID is missing.",
        variant: "destructive"
      });
      return;
    }
    
    handleStatRecorded(stat);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  if (!game) {
    return <p>Game not found</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      {game && (
        <StatTracker
          game={game}
          statTypes={statTypes}
          onStatRecorded={handleStatRecordedWrapper}
          existingStats={gameStats}
        />
      )}

      {game && (
        <GameStatsList
          gameStats={gameStats}
          game={game}
          onDelete={handleStatDeleted}
        />
      )}
    </div>
  );
}
