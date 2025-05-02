
import React from 'react';
import { Button } from '@/components/ui/button';
import { Game, User } from '@/types';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

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
  isOpponentTeam?: boolean;
  opponentJerseyNumbers?: {
    scorer: string;
    primaryAssist: string;
    secondaryAssist: string;
  };
}

export function GoalSummaryStep({ 
  game, 
  selectedScorer, 
  primaryAssist, 
  secondaryAssist, 
  period, 
  playersOnIce,
  isSubmitting,
  onCancel,
  onSubmit,
  isOpponentTeam = false,
  opponentJerseyNumbers
}: GoalSummaryStepProps) {
  const selectedTeam = isOpponentTeam ? game.awayTeam : game.homeTeam;
  const teamName = selectedTeam?.name || (isOpponentTeam ? 'Opponent' : 'Home Team');

  const handleSubmitClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Submit button clicked, calling onSubmit handler");
    onSubmit();
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Goal Summary</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Review goal details before submitting
        </p>
      </div>
      
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Period</p>
            <p className="font-medium">{period}</p>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Team</p>
            <p className="font-medium">{teamName}</p>
          </div>
          
          {isOpponentTeam ? (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Scorer</p>
                <p className="font-medium">
                  {opponentJerseyNumbers?.scorer ? 
                    `Jersey #${opponentJerseyNumbers.scorer}` : 
                    'Not specified'}
                </p>
              </div>
              
              {opponentJerseyNumbers?.primaryAssist && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Primary Assist</p>
                  <p className="font-medium">Jersey #{opponentJerseyNumbers.primaryAssist}</p>
                </div>
              )}
              
              {opponentJerseyNumbers?.secondaryAssist && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Secondary Assist</p>
                  <p className="font-medium">Jersey #{opponentJerseyNumbers.secondaryAssist}</p>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Scorer</p>
                <p className="font-medium">{selectedScorer?.name || 'Not selected'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Primary Assist</p>
                <p className="font-medium">{primaryAssist?.name || 'None'}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Secondary Assist</p>
                <p className="font-medium">{secondaryAssist?.name || 'None'}</p>
              </div>
            </>
          )}
          
          <Separator />
          
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Players on Ice</p>
            {playersOnIce.length > 0 ? (
              <ul className="list-disc pl-5">
                {playersOnIce.map((player) => (
                  <li key={player.id}>
                    {player.name}
                    {player.position ? ` (${player.position})` : ''}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic">No players selected</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmitClick} disabled={isSubmitting}>
          {isSubmitting ? 'Recording...' : 'Record Goal'}
        </Button>
      </div>
    </div>
  );
}
