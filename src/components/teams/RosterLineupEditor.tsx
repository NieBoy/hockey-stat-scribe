
import { useState } from 'react';
import { Team, Lines, Position, User } from '@/types';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import { RosterContainer } from './lineup/RosterContainer';
import { PlayerSelectionModal } from './lineup/PlayerSelectionModal';
import { Button } from '@/components/ui/button';

interface RosterLineupEditorProps {
  team: Team;
  onSave: () => Promise<boolean>;
  isSaving?: boolean;
}

export default function RosterLineupEditor({ team, onSave, isSaving = false }: RosterLineupEditorProps) {
  const {
    lines,
    availablePlayers,
    handlePlayerMove,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    isLoading
  } = useLineupEditor(team);

  const [selectedLineType, setSelectedLineType] = useState<'forwards' | 'defense' | 'goalies' | null>(null);
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<User | null>(null);

  const handlePositionClick = (
    lineType: 'forwards' | 'defense' | 'goalies', 
    lineIndex: number, 
    position: Position, 
    player: User | null
  ) => {
    console.log(`Position clicked: ${lineType}, line ${lineIndex}, position ${position}`);
    setSelectedLineType(lineType);
    setSelectedLineIndex(lineIndex);
    setSelectedPosition(position);
    setSelectedPlayer(player);
  };

  const closePlayerSelection = () => {
    setSelectedLineType(null);
    setSelectedPosition(null);
    setSelectedPlayer(null);
  };

  const handlePlayerSelected = (playerId: string) => {
    if (!selectedLineType || !selectedPosition) return;
    
    console.log(`Selected player ${playerId} for ${selectedLineType}, line ${selectedLineIndex}, position ${selectedPosition}`);
    handlePlayerSelect(selectedLineType, selectedLineIndex, selectedPosition, playerId);
    closePlayerSelection();
  };

  const handleSaveClick = async () => {
    console.log("Save clicked in RosterLineupEditor");
    await onSave();
  };

  return (
    <div className="space-y-4">
      <RosterContainer
        team={team}
        lines={lines}
        availablePlayers={availablePlayers}
        handlePlayerMove={handlePlayerMove}
        addForwardLine={addForwardLine}
        addDefenseLine={addDefenseLine}
        onPositionClick={handlePositionClick}
      />

      {selectedLineType && selectedPosition && (
        <PlayerSelectionModal
          currentTab={selectedLineType}
          selectedLineIndex={selectedLineIndex}
          selectedPosition={selectedPosition}
          currentPlayer={selectedPlayer}
          availablePlayers={availablePlayers}
          onPlayerSelect={handlePlayerSelected}
          onCancel={closePlayerSelection}
        >
          <Button variant="outline">Select Player</Button>
        </PlayerSelectionModal>
      )}
    </div>
  );
}
