
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface GameControlsProps {
  period: number;
  teamType: 'home' | 'away';
  onTeamChange: (team: 'home' | 'away') => void;
}

export default function GameControls({ 
  period, 
  teamType, 
  onTeamChange 
}: GameControlsProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Period {period}</h3>
      </div>

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
    </div>
  );
}
