import React, { useState, useEffect } from 'react';
import { Team, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SimplePlayerList from '@/components/teams/SimplePlayerList';
import { toast } from 'sonner';

interface PlayersOnIceStepProps {
  team: Team;
  onPlayersSelect: (players: User[]) => void;
  preSelectedPlayers: User[];
  onComplete: () => void;
}

export function PlayersOnIceStep({
  team,
  onPlayersSelect,
  preSelectedPlayers,
  onComplete
}: PlayersOnIceStepProps) {
  // Always store the list as User[] to keep selection logic compatible
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);
  const [mandatoryPlayers, setMandatoryPlayers] = useState<User[]>([]);
  
  // Initialize with preselected players when the component mounts or preSelectedPlayers changes
  useEffect(() => {
    if (preSelectedPlayers && preSelectedPlayers.length > 0) {
      // Ensure each player is a valid User object and deduplicate by ID
      const validPlayers = preSelectedPlayers
        .filter(Boolean)
        .map(player => ({
          id: player.id,
          name: player.name,
          number: player.number || '',
        } as User));
      
      // Create a unique list by player ID
      const uniquePlayers = Array.from(
        new Map(validPlayers.map(p => [p.id, p])).values()
      );
      
      console.log("Setting preselected players:", uniquePlayers);
      setSelectedPlayers(uniquePlayers);
      setMandatoryPlayers(uniquePlayers);
    }
  }, [preSelectedPlayers]);

  // Handle player selection/deselection
  const handlePlayerSelect = (player: User) => {
    // Check if player is already selected
    const isSelected = selectedPlayers.some(p => p.id === player.id);
    console.log(`Player ${player.name} (${player.id}) selection status: ${isSelected}`);
    
    if (isSelected) {
      // Don't allow deselection of mandatory players (scorer & assists)
      if (mandatoryPlayers.some(p => p.id === player.id)) {
        toast(`${player.name} cannot be deselected`);
        return;
      }
      // Remove from selection
      const newSelection = selectedPlayers.filter(p => p.id !== player.id);
      console.log("New selection after deselect:", newSelection);
      setSelectedPlayers(newSelection);
      onPlayersSelect(newSelection);
    } else {
      // Check if we've reached the maximum of 6 players
      if (selectedPlayers.length >= 6) {
        toast("Maximum of 6 players allowed on ice");
        return;
      }
      // Add to selection
      const newSelection = [...selectedPlayers, player];
      console.log("New selection after select:", newSelection);
      setSelectedPlayers(newSelection);
      onPlayersSelect(newSelection);
    }
  };

  // Handle final confirmation of players
  const handleConfirm = () => {
    if (selectedPlayers.length === 0) {
      toast("Please select at least one player");
      return;
    }
    
    // Add any mandatory players not in selection
    const finalSelection = [...selectedPlayers];
    
    // Ensure all mandatory players are included
    for (const mandatory of mandatoryPlayers) {
      if (!finalSelection.some(p => p.id === mandatory.id)) {
        finalSelection.push(mandatory);
      }
    }
    
    // Limit to 6 players maximum
    const limitedSelection = finalSelection.slice(0, 6);
    console.log("Final players on ice selection:", limitedSelection);
    
    onPlayersSelect(limitedSelection);
    onComplete();
  };

  return (
    <div>
      <div className="mb-3">
        <h3 className="text-lg font-medium">Select players on ice (+/-)</h3>
        <p className="text-sm text-muted-foreground">
          Select all players on the ice at the time of the goal (max 6)
        </p>

        <div className="mt-3 mb-4">
          <p className="text-sm font-medium">
            Selected: {selectedPlayers.length}/6 players
          </p>
          {mandatoryPlayers.length > 0 && (
            <p className="text-xs text-amber-600">
              Players involved in the goal (scorer/assists) are automatically included
            </p>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {team.players && team.players.length > 0 ? (
            <>
              <SimplePlayerList
                players={team.players as User[]}
                onPlayerSelect={handlePlayerSelect}
                selectedPlayers={selectedPlayers}
              />
              <div className="mt-4 flex justify-end">
                <Button 
                  onClick={handleConfirm}
                  disabled={selectedPlayers.length === 0}
                >
                  Confirm Players
                </Button>
              </div>
            </>
          ) : (
            <p>No players available for selection</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
