
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircle, StopCircle, ListEnd } from "lucide-react";
import { GameStatus } from "@/types/game-control";

interface GameStatusControlsProps {
  status: GameStatus;
  period: number;
  isActive?: boolean;
  currentPeriod?: number;
  totalPeriods?: number;
  onStartGame: () => Promise<void>;
  onStopGame: () => Promise<void>;
  onEndPeriod: () => Promise<void>;
  onPeriodChange?: (period: number) => void;
  onToggleStatus?: () => Promise<void>;
}

export default function GameStatusControls({
  status,
  period,
  isActive,
  currentPeriod,
  totalPeriods = 3,
  onStartGame,
  onStopGame,
  onEndPeriod,
  onPeriodChange,
  onToggleStatus
}: GameStatusControlsProps) {
  // Use either the direct props or the legacy props
  const handleToggle = onToggleStatus || (isActive ? onStopGame : onStartGame);
  const displayPeriod = currentPeriod !== undefined ? currentPeriod : period;
  
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Game Status:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              status === 'in-progress' ? 'bg-green-100 text-green-800' :
              status === 'stopped' ? 'bg-amber-100 text-amber-800' :
              'bg-slate-100 text-slate-800'
            }`}>
              {status === 'in-progress' ? 'In Progress' : 
              status === 'stopped' ? 'Stopped' : 'Not Started'}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium">Current Period:</span>
            <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
              Period {displayPeriod}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {(status !== 'in-progress') && (
              <Button 
                variant="default" 
                className="flex items-center gap-2"
                onClick={onStartGame}
              >
                <PlayCircle className="h-4 w-4" />
                {status === 'not-started' ? 'Start Game' : 'Resume Game'}
              </Button>
            )}
            
            {status === 'in-progress' && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={onStopGame}
              >
                <StopCircle className="h-4 w-4" />
                Stop Game
              </Button>
            )}
            
            {status === 'in-progress' && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 sm:col-span-2"
                onClick={onEndPeriod}
              >
                <ListEnd className="h-4 w-4" />
                End Period {displayPeriod}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
