
import React from 'react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GameStatus } from '@/types/game-control';

interface GameControlsProps {
  period: number;
  teamType: 'home' | 'away';
  onTeamChange: (team: 'home' | 'away') => void;
  gameStatus: GameStatus;
  onStartGame: () => void;
  onStopGame: () => void;
  onPeriodEnd: () => void;
  onStoppage: () => void;
}

export default function GameControls({ 
  period, 
  teamType, 
  gameStatus,
  onTeamChange,
  onStartGame,
  onStopGame,
  onPeriodEnd,
  onStoppage
}: GameControlsProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold bg-primary/10 px-4 py-2 rounded-md">
          Period {period}
        </h3>
        
        {gameStatus === 'not-started' && (
          <Button 
            onClick={onStartGame}
            size="lg"
          >
            Start Game
          </Button>
        )}

        {gameStatus === 'in-progress' && (
          <Button 
            onClick={onStopGame}
            size="lg"
            variant="destructive"
          >
            Stop Game
          </Button>
        )}

        {gameStatus === 'stopped' && (
          <div className="w-full space-y-4">
            <Button 
              onClick={onPeriodEnd}
              size="lg"
              className="w-full"
            >
              {period >= 3 ? 'End Game' : `End of Period ${period}`}
            </Button>
            <Button 
              onClick={onStoppage}
              size="lg"
              variant="secondary"
              className="w-full"
            >
              Game Stoppage
            </Button>
          </div>
        )}
      </div>

      {gameStatus === 'in-progress' && (
        <div className="space-y-2">
          <Label>Team</Label>
          <RadioGroup
            value={teamType}
            onValueChange={(value) => onTeamChange(value as 'home' | 'away')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="home" id="home" />
              <Label htmlFor="home">Home</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="away" id="away" />
              <Label htmlFor="away">Away</Label>
            </div>
          </RadioGroup>
        </div>
      )}
    </div>
  );
}
