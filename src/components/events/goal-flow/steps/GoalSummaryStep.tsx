
import React from 'react';
import { Game, User } from '@/types';
import { GoalActions } from '../GoalActions';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface GoalSummaryStepProps {
  game: Game;
  selectedScorer: User | null;
  primaryAssist: User | null;
  secondaryAssist: User | null;
  period: number;
  playersOnIce: User[];
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function GoalSummaryStep({
  selectedScorer,
  primaryAssist,
  secondaryAssist,
  period,
  playersOnIce,
  isSubmitting,
  onCancel,
  onSubmit
}: GoalSummaryStepProps) {
  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-medium">Goal Summary</h3>
      </div>
      <div className="space-y-2 bg-muted/50 p-4 rounded-md">
        <p><strong>Scorer:</strong> {selectedScorer?.name || 'None'}</p>
        <p><strong>Primary Assist:</strong> {primaryAssist?.name || 'None'}</p>
        <p><strong>Secondary Assist:</strong> {secondaryAssist?.name || 'None'}</p>
        <p><strong>Period:</strong> {period}</p>
        <div>
          <p><strong>Players on Ice (+/-):</strong></p>
          <ul className="list-disc pl-5 mt-1">
            {playersOnIce.map(player => (
              <li key={player.id}>
                {player.name}
                {selectedScorer?.id === player.id && ' (scorer)'}
                {primaryAssist?.id === player.id && ' (primary assist)'}
                {secondaryAssist?.id === player.id && ' (secondary assist)'}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={onCancel} 
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        
        <Button 
          onClick={onSubmit} 
          disabled={isSubmitting}
          className="flex items-center gap-1"
        >
          <Check className="h-4 w-4" />
          {isSubmitting ? 'Saving...' : 'Save Goal'}
        </Button>
      </div>
    </div>
  );
}
