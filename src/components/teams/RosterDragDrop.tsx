
import { useState, useEffect } from 'react';
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
  const {
    lines,
    setLines,
    availablePlayers,
    handlePlayerMove,
    addForwardLine,
    addDefenseLine,
  } = useLineupEditor(team);

  // Auto-save whenever lines change
  useEffect(() => {
    const saveLines = async () => {
      try {
        await onSave(lines);
      } catch (error) {
        console.error("Error auto-saving lineup:", error);
      }
    };
    
    // Add a small delay to prevent too frequent saves
    const timeoutId = setTimeout(() => {
      saveLines();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [lines, onSave]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) {
      return;
    }
    
    if (source.droppableId === destination.droppableId) {
      return;
    }
    
    const parts = draggableId.split('-');
    let playerId: string;
    
    if (parts[0] === 'roster') {
      playerId = parts.slice(1).join('-');
    } else {
      playerId = parts.slice(3).join('-');
    }
    
    handlePlayerMove({
      playerId,
      sourceId: source.droppableId,
      destinationId: destination.droppableId
    });
    
    toast.success('Player position updated');
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-6">
        <AvailablePlayersSection availablePlayers={availablePlayers} />

        <Tabs defaultValue="even-strength" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="even-strength">Even Strength</TabsTrigger>
            <TabsTrigger value="power-play">Power Play</TabsTrigger>
            <TabsTrigger value="penalty-kill">Penalty Kill</TabsTrigger>
          </TabsList>
          
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
              players={lines.specialTeams?.powerPlay}
            />
          </TabsContent>
          
          <TabsContent value="penalty-kill">
            <SpecialTeamsUnit
              title="Penalty Kill Units"
              units={[1, 2]}
              positions={['LF', 'RF', 'LD', 'RD']}
              type="pk"
              players={lines.specialTeams?.penaltyKill}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DragDropContext>
  );
}
