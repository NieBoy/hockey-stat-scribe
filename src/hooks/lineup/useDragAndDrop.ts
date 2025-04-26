import { Lines } from "@/types";

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
  
  // This hook is now a placeholder since we've removed drag-and-drop functionality
  // It remains to avoid import errors, but doesn't do anything
  
  const onDragEnd = (result: any) => {
    // Drag and drop functionality has been removed
    console.log("Drag and drop has been removed");
    return;
  };
  
  return {
    onDragEnd
  };
}
