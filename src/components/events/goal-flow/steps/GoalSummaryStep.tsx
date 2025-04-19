
import React from 'react';
import { Game, User } from '@/types';
import { GoalActions } from '../GoalActions';

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
        <p><strong>Scorer:</strong> {selectedScorer?.name}</p>
        <p><strong>Primary Assist:</strong> {primaryAssist?.name || 'None'}</p>
        <p><strong>Secondary Assist:</strong> {secondaryAssist?.name || 'None'}</p>
        <p><strong>Period:</strong> {period}</p>
        <div>
          <p><strong>Players on Ice:</strong></p>
          <ul className="list-disc pl-5 mt-1">
            {playersOnIce.map(player => (
              <li key={player.id}>{player.name}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <GoalActions 
          isSubmitting={isSubmitting} 
          onCancel={onCancel} 
          onSubmit={onSubmit}
          showSubmit={true}
        />
      </div>
    </div>
  );
}
