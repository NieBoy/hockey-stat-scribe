
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
  // Using player IDs for selection management
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(selectedPlayers.map(p => p.id))
  );

  // Reset selectedIds when selectedPlayers prop changes
  useEffect(() => {
    console.log("PlayerLines - selectedPlayers changed:", selectedPlayers);
    setSelectedIds(new Set(selectedPlayers.map(p => p.id)));
  }, [selectedPlayers, forceRefresh]);

  const handlePlayerClick = (player: User) => {
    if (multiSelect) {
      const newSelectedIds = new Set(selectedIds);
      
      if (selectedIds.has(player.id)) {
        // Deselect if already selected
        newSelectedIds.delete(player.id);
        console.log(`PlayerLines - Deselected player: ${player.name}`);
      } else {
        // Check if we've hit the max selections limit
        if (maxSelections && newSelectedIds.size >= maxSelections) {
          console.log(`PlayerLines - Max selections (${maxSelections}) reached`);
          return;
        }
        // Select if not already selected
        newSelectedIds.add(player.id);
        console.log(`PlayerLines - Selected player: ${player.name}`);
      }
      
      setSelectedIds(newSelectedIds);
      
      // Convert Set of IDs back to array of player objects
      if (onMultiPlayerSelect) {
        const selectedPlayersList = team.players.filter(p => newSelectedIds.has(p.id));
        console.log("PlayerLines - Updated selected players:", selectedPlayersList);
        onMultiPlayerSelect([...selectedPlayersList]); // Create a new array to ensure reference changes
      }
    } else if (onPlayerSelect) {
      console.log(`PlayerLines - Selected single player: ${player.name}`);
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
  console.log("PlayerLines - Current selected players count:", selectedPlayersList.length);

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
