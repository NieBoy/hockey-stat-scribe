
import { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Team, Lines, User } from '@/types';
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
    if (!destination) {
      console.log("Dropped outside a droppable area");
      return;
    }
    
    console.log("Drag ended:", { source, destination, draggableId });
    
    // Prevent dropping onto self
    if (source.droppableId === destination.droppableId) {
      return;
    }
    
    // Extract player ID from draggable ID
    // Format can be one of:
    // roster-[playerId]
    // [type]-[lineNumber]-[position]-[playerId]
    const parts = draggableId.split('-');
    let playerId: string;
    
    if (parts[0] === 'roster') {
      playerId = parts.slice(1).join('-');
    } else {
      // The playerId is the last segment(s)
      playerId = parts.slice(3).join('-');
    }
    
    // Move the player using the simplified API
    handlePlayerMove({
      playerId,
      sourceId: source.droppableId,
      destinationId: destination.droppableId
    });
    
    // Show success toast
    toast.success('Player position updated');
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
