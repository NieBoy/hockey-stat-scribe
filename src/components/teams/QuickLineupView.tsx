
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
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Save whenever lines change
  useEffect(() => {
    if (!team?.id) return;
    
    const saveLines = async () => {
      try {
        setSaveStatus('saving');
        console.log("Saving lineup for team:", team.id);
        const success = await updateTeamLineup(team.id, lines);
        
        if (success) {
          console.log("Successfully saved lineup changes");
          setSaveStatus('success');
          toast.success("Lineup saved");
        } else {
          console.error("Failed to save lineup changes");
          setSaveStatus('error');
          toast.error("Failed to save lineup");
        }
      } catch (error) {
        console.error("Error saving lineup:", error);
        setSaveStatus('error');
        toast.error("Error saving lineup");
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
    
    // Parse the draggableId to get player information
    const parts = draggableId.split('-');
    const playerId = parts[0] === 'roster' ? parts.slice(1).join('-') : parts.slice(3).join('-');
    
    // Check if dragging to a position that already has a player
    // If so, we'll want to swap players instead of just moving one
    let swapPlayerId: string | null = null;
    
    // Different handling if moving between existing positions vs from roster
    if (source.droppableId !== 'roster' && destination.droppableId !== 'roster') {
      // Find if there's a player in the destination position
      const destParts = destination.droppableId.split('-');
      const lineType = destParts[0];
      const lineNumber = parseInt(destParts[1], 10);
      const position = destParts[2];
      
      if (lineType === 'forward') {
        const line = lines.forwards[lineNumber - 1];
        if (position === 'LW' && line.leftWing) swapPlayerId = line.leftWing.id;
        else if (position === 'C' && line.center) swapPlayerId = line.center.id;
        else if (position === 'RW' && line.rightWing) swapPlayerId = line.rightWing.id;
      } else if (lineType === 'defense') {
        const line = lines.defense[lineNumber - 1];
        if (position === 'LD' && line.leftDefense) swapPlayerId = line.leftDefense.id;
        else if (position === 'RD' && line.rightDefense) swapPlayerId = line.rightDefense.id;
      }
      
      // If there's a player to swap, move them to the source position
      if (swapPlayerId) {
        console.log(`Swapping player ${swapPlayerId} to position ${source.droppableId}`);
        handlePlayerMove({
          playerId: swapPlayerId,
          sourceId: destination.droppableId,
          destinationId: source.droppableId
        });
      }
    }
    
    // Move the dragged player to the destination
    console.log(`Moving player ${playerId} from ${source.droppableId} to ${destination.droppableId}`);
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
