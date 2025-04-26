import { Lines } from "@/types";
import { DraggableLocation } from "@hello-pangea/dnd";
import { removePlayerFromCurrentPosition } from "@/utils/lineupUtils";

interface UseDragAndDropProps {
  lines: Lines;
  availablePlayers: any[];
  handlePlayerMove: (sourceId: string, destId: string, playerId: string) => void;
}

export function useDragAndDrop({ 
  lines, 
  availablePlayers, 
  handlePlayerMove 
}: UseDragAndDropProps) {
  
  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination, the player was dropped outside a valid drop area
    if (!destination) {
      return;
    }
    
    // If source and destination are the same exact spot, nothing changed
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    
    console.log(`Player ${draggableId} moved from ${source.droppableId} to ${destination.droppableId}`);
    
    // Extract the player ID from the draggableId
    // The draggableId follows the format: `${playerId}-${playerName}`
    const playerId = draggableId.split('-')[0];
    
    // First, remove the player from their current position if they're already in the lineup
    removePlayerFromCurrentPosition(playerId, lines);
    
    // Then move the player to their new position
    handlePlayerMove(source.droppableId, destination.droppableId, playerId);
  };
  
  return {
    onDragEnd
  };
}
