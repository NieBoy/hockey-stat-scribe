
import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Team, Lines, Position, User } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import { AvailablePlayersSection } from './lineup/AvailablePlayersSection';
import { EvenStrengthLines } from './lineup/EvenStrengthLines';
import { SpecialTeamsUnit } from './lineup/SpecialTeamsUnit';

interface RosterDragDropProps {
  team: Team;
  onSave: (lines: Lines) => Promise<void>;
  isSaving?: boolean;
}

export default function RosterDragDrop({ team, onSave, isSaving = false }: RosterDragDropProps) {
  const [activeTab, setActiveTab] = useState('even-strength');
  
  const {
    lines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    handlePlayerMove,
  } = useLineupEditor(team);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside a droppable area
    if (!destination) return;
    
    console.log("Drag ended:", { source, destination, draggableId });
    
    // Parse the draggable ID to get player details
    // Format: [type]-[lineNumber]-[position]-[playerId]
    const parts = draggableId.split('-');
    
    // Handle the case where we have a roster draggable
    let playerType: 'roster' | 'forward' | 'defense' | 'goalie';
    let lineNumber: number;
    let position: Position | null;
    let playerId: string;
    
    if (parts[0] === 'roster') {
      playerType = 'roster';
      lineNumber = 0;
      position = null;
      // Player ID is the last part
      playerId = parts.slice(3).join('-');
    } else {
      playerType = parts[0] as 'forward' | 'defense' | 'goalie';
      lineNumber = parseInt(parts[1], 10);
      position = parts[2] as Position;
      // Player ID is the last part
      playerId = parts.slice(3).join('-');
    }
    
    console.log("Parsed draggable ID:", { playerType, lineNumber, position, playerId });
    
    // Parse destination ID to get drop details
    // Format: [type]-[lineNumber]
    const destParts = destination.droppableId.split('-');
    const destType = destParts[0] as 'forward' | 'defense' | 'goalie' | 'pp' | 'pk' | 'remove';
    const destLineNumber = destParts.length > 1 ? parseInt(destParts[1], 10) : 0;
    
    console.log("Parsed destination:", { destType, destLineNumber });
    
    // Handle drops into roster
    if (destination.droppableId === 'roster') {
      handlePlayerMove({
        playerId,
        sourceType: playerType,
        sourceLineNumber: lineNumber,
        sourcePosition: position,
        destType: 'remove',
        destLineNumber: 0,
        destPosition: null
      });
      toast.success('Player moved to roster');
      return;
    }

    // Get destination position based on index (for forward and defense lines)
    let destPosition: Position | null = null;
    
    if (destType === 'forward') {
      // Map index to forward position
      const positions: Position[] = ['LW', 'C', 'RW'];
      destPosition = positions[destination.index];
    } else if (destType === 'defense') {
      // Map index to defense position
      const positions: Position[] = ['LD', 'RD'];
      destPosition = positions[destination.index];
    } else if (destType === 'pp') {
      // Power play positions
      const positions: Position[] = ['LW', 'C', 'RW', 'LD', 'RD'];
      destPosition = positions[destination.index];
    } else if (destType === 'pk') {
      // Penalty kill positions
      const positions: Position[] = ['LF', 'RF', 'LD', 'RD'];
      destPosition = positions[destination.index];
    } else if (destType === 'goalies') {
      destPosition = 'G';
    }

    console.log("Destination position:", destPosition);
    
    // Move player to new position
    if (destPosition) {
      handlePlayerMove({
        playerId,
        sourceType: playerType,
        sourceLineNumber: lineNumber,
        sourcePosition: position,
        destType: destType,
        destLineNumber: destLineNumber,
        destPosition
      });
      toast.success(`Player moved to ${destType} line ${destLineNumber || ''} ${destPosition}`);
    }
  };

  const handleSaveLineup = async () => {
    try {
      await onSave(lines);
      toast.success('Lineup saved successfully');
    } catch (error) {
      console.error('Error saving lineup:', error);
      toast.error('Failed to save lineup');
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Team Roster</h2>
          <Button onClick={handleSaveLineup} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Lineup'}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="even-strength">Even Strength</TabsTrigger>
            <TabsTrigger value="power-play">Power Play</TabsTrigger>
            <TabsTrigger value="penalty-kill">Penalty Kill</TabsTrigger>
          </TabsList>
          
          <AvailablePlayersSection availablePlayers={availablePlayers} />
          
          <TabsContent value="even-strength">
            <EvenStrengthLines 
              lines={lines}
              onAddForwardLine={addForwardLine}
              onAddDefenseLine={addDefenseLine}
            />
          </TabsContent>
          
          <TabsContent value="power-play">
            <SpecialTeamsUnit
              title="Power Play Units"
              units={[1, 2]}
              positions={['LW', 'C', 'RW', 'LD', 'RD']}
              type="pp"
            />
          </TabsContent>
          
          <TabsContent value="penalty-kill">
            <SpecialTeamsUnit
              title="Penalty Kill Units"
              units={[1, 2]}
              positions={['LF', 'RF', 'LD', 'RD']}
              type="pk"
            />
          </TabsContent>
        </Tabs>
      </div>
    </DragDropContext>
  );
}
