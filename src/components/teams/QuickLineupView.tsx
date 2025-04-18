
import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Team, Lines } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import { EvenStrengthLines } from './lineup/EvenStrengthLines';
import { updateTeamLineup } from '@/services/teams';
import { toast } from 'sonner';

interface QuickLineupViewProps {
  team: Team;
}

export function QuickLineupView({ team }: QuickLineupViewProps) {
  const {
    lines,
    setLines,
    handlePlayerMove,
  } = useLineupEditor(team);

  // Auto-save whenever lines change
  useEffect(() => {
    const saveLines = async () => {
      try {
        await updateTeamLineup(team.id, lines);
      } catch (error) {
        console.error("Error auto-saving lineup:", error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      saveLines();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [lines, team.id]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    
    const parts = draggableId.split('-');
    const playerId = parts[0] === 'roster' ? parts.slice(1).join('-') : parts.slice(3).join('-');
    
    handlePlayerMove({
      playerId,
      sourceId: source.droppableId,
      destinationId: destination.droppableId
    });
    
    toast.success('Player position updated');
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Current Lineup</CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="space-y-6">
            <EvenStrengthLines 
              lines={lines}
              onAddForwardLine={() => {}}
              onAddDefenseLine={() => {}}
            />
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}
