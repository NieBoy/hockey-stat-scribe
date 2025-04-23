
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Game, User } from '@/types';
import { PlayerSelect } from './goal-flow/PlayerSelect';
import { recordHitEvent } from '@/services/events/hits/hitsEventService';
import { toast } from 'sonner';

interface HitsFlowProps {
  game: Game;
  period: number;
  onComplete: () => void;
  onCancel: () => void;
}

export default function HitsFlow({ game, period, onComplete, onCancel }: HitsFlowProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlayerSelect = (player: User | null) => {
    setSelectedPlayer(player);
  };

  const handleSubmit = async () => {
    if (!selectedPlayer) return;

    setIsSubmitting(true);
    try {
      await recordHitEvent({
        gameId: game.id,
        period,
        teamType: 'home', // Always recording hits for the home team
        playerId: selectedPlayer.id
      });
      
      toast.success("Hit recorded successfully");
      onComplete();
    } catch (error) {
      console.error("Error recording hit:", error);
      toast.error("Failed to record hit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <PlayerSelect
          team={game.homeTeam}
          title="Select Player Who Made the Hit"
          onPlayerSelect={handlePlayerSelect}
          selectedPlayers={selectedPlayer ? [selectedPlayer] : []}
          showLineups={true}
        />
        
        {selectedPlayer && (
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Record Hit'}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
