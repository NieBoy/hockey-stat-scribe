
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface GameControlsProps {
  period: number;
  teamType: 'home' | 'away';
  onPeriodChange: (period: number) => void;
  onTeamChange: (team: 'home' | 'away') => void;
}

export default function GameControls({ 
  period, 
  teamType, 
  onPeriodChange, 
  onTeamChange 
}: GameControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-6 mb-6">
      <div className="space-y-2">
        <Label>Period</Label>
        <Select value={period.toString()} onValueChange={(value) => onPeriodChange(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Period 1</SelectItem>
            <SelectItem value="2">Period 2</SelectItem>
            <SelectItem value="3">Period 3</SelectItem>
            <SelectItem value="4">Overtime</SelectItem>
          </SelectContent>
        </Select>
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
