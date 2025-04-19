
import { useState, useEffect } from 'react';
import { Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SimplePlayerList from '../teams/SimplePlayerList';

interface PlayerLinesProps {
  team: Team;
  onPlayerSelect?: (player: User) => void;
  onMultiPlayerSelect?: (players: User[]) => void;
  selectedPlayers: User[];
  multiSelect?: boolean;
  allowSkip?: boolean;
  onSkip?: () => void;
  skipText?: string;
  allowComplete?: boolean;
  onComplete?: () => void;
  completeText?: string;
  maxSelections?: number;
  forceRefresh?: boolean;
}

export default function PlayerLines({
  team,
  onPlayerSelect,
  onMultiPlayerSelect,
  selectedPlayers = [],
  multiSelect = false,
  allowSkip = false,
  onSkip,
  skipText = "Skip",
  allowComplete = false,
  onComplete,
  completeText = "Complete",
  maxSelections,
  forceRefresh = false
}: PlayerLinesProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedPlayers.map(p => p.id))
  );

  // Update selected IDs when prop changes
  useEffect(() => {
    setSelectedIds(new Set(selectedPlayers.map(p => p.id)));
  }, [selectedPlayers, forceRefresh]);

  const handlePlayerClick = (player: User) => {
    if (multiSelect) {
      const newSelectedIds = new Set(selectedIds);
      
      if (selectedIds.has(player.id)) {
        newSelectedIds.delete(player.id);
      } else {
        if (maxSelections && newSelectedIds.size >= maxSelections) {
          return;
        }
        newSelectedIds.add(player.id);
      }
      
      setSelectedIds(newSelectedIds);
      
      if (onMultiPlayerSelect) {
        const selectedPlayersList = team.players.filter(p => newSelectedIds.has(p.id));
        onMultiPlayerSelect(selectedPlayersList);
      }
    } else if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  // Sort players by number when possible
  const sortedPlayers = [...team.players].sort((a, b) => {
    const numA = a.number ? parseInt(a.number) : 999;
    const numB = b.number ? parseInt(b.number) : 999;
    return numA - numB;
  });

  const selectedPlayersList = sortedPlayers.filter(p => selectedIds.has(p.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{multiSelect ? "Select Players" : "Select Player"}</CardTitle>
      </CardHeader>
      <CardContent>
        <SimplePlayerList 
          players={sortedPlayers}
          onPlayerSelect={handlePlayerClick}
          selectedPlayers={selectedPlayersList}
        />
        
        <div className="mt-4 flex gap-2 justify-end">
          {allowSkip && onSkip && (
            <Button type="button" variant="ghost" onClick={onSkip}>
              {skipText || "Skip"}
            </Button>
          )}
          {allowComplete && onComplete && (
            <Button 
              type="button" 
              onClick={onComplete}
              disabled={multiSelect && selectedPlayersList.length === 0}
            >
              {completeText || "Complete"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
