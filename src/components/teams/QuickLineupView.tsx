
import { useState, useEffect, useRef } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Team, Lines } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import { EvenStrengthLines } from './lineup/EvenStrengthLines';
import { updateTeamLineup } from '@/services/teams';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface QuickLineupViewProps {
  team: Team;
}

export function QuickLineupView({ team }: QuickLineupViewProps) {
  const {
    lines,
    handlePlayerMove,
  } = useLineupEditor(team);
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  // Use a ref to track if the component is mounted to prevent setState after unmount
  const isMounted = useRef(true);
  const queryClient = useQueryClient();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Set up cleanup when component unmounts
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Save whenever lines change
  useEffect(() => {
    if (!team?.id) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    const saveLines = async () => {
      try {
        if (!isMounted.current) return;
        
        setSaveStatus('saving');
        console.log("Saving lineup for team:", team.id);
        console.log("Lineup data to save:", JSON.stringify(lines, null, 2));
        
        const success = await updateTeamLineup(team.id, lines);
        
        if (!isMounted.current) return;
        
        if (success) {
          console.log("Successfully saved lineup changes");
          setSaveStatus('success');
          
          // Invalidate the team query to ensure all components get fresh data
          queryClient.invalidateQueries({ queryKey: ['team', team.id] });
          
          // Reset status after delay
          if (isMounted.current) {
            setTimeout(() => {
              if (isMounted.current) setSaveStatus('idle');
            }, 2000);
          }
        } else {
          console.error("Failed to save lineup changes");
          setSaveStatus('error');
          toast.error("Failed to save lineup");
        }
      } catch (error) {
        console.error("Error saving lineup:", error);
        if (isMounted.current) {
          setSaveStatus('error');
          toast.error("Error saving lineup");
        }
      }
    };
    
    // Only save if there are players in the lineup
    const hasPlayers = lines.forwards.some(line => line.leftWing || line.center || line.rightWing) || 
                     lines.defense.some(line => line.leftDefense || line.rightDefense) || 
                     lines.goalies.length > 0;
    
    // Add a small delay to prevent too frequent saves 
    if (hasPlayers) {
      console.log("Auto-saving lineup changes");
      saveTimeoutRef.current = setTimeout(() => {
        saveLines();
      }, 800);
    } else {
      console.log("Skipping auto-save since lineup is empty");
    }
    
  }, [lines, team?.id, queryClient]);

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
        <div className="flex justify-between items-center">
          <CardTitle>Current Lineup</CardTitle>
          {saveStatus === 'saving' && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </Badge>
          )}
          {saveStatus === 'success' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Saved
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="destructive">
              Save Error
            </Badge>
          )}
        </div>
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
