
import { DropResult } from '@hello-pangea/dnd';
import { Lines, User } from '@/types';

interface UseDragAndDropProps {
  lines: Lines;
  availablePlayers: User[];
  handlePlayerMove: (
    player: User,
    sourceLineType: 'forwards' | 'defense' | 'goalies',
    sourceLineIndex: number,
    sourcePosition: string,
    targetLineType: 'forwards' | 'defense' | 'goalies',
    targetLineIndex: number,
    targetPosition: string
  ) => void;
}

type LineType = 'forwards' | 'defense' | 'goalies' | 'available';

interface PositionInfo {
  lineType: LineType;
  lineIndex: number;
  position: string;
}

export function useDragAndDrop({ lines, availablePlayers, handlePlayerMove }: UseDragAndDropProps) {
  const parseDroppableId = (droppableId: string): PositionInfo | null => {
    if (droppableId === 'available-players') {
      return {
        lineType: 'available',
        lineIndex: 0,
        position: 'available'
      };
    }
    
    const parts = droppableId.split('-');
    
    if (parts.length >= 4) {
      const lineTypeStr = parts[0];
      let lineType: LineType;
      
      if (lineTypeStr === 'forward') {
        lineType = 'forwards';
      } else if (lineTypeStr === 'defense') {
        lineType = 'defense';
      } else if (lineTypeStr === 'goalie') {
        lineType = 'goalies';
      } else {
        return null;
      }
      
      return {
        lineType,
        lineIndex: parseInt(parts[2], 10),
        position: parts[3]
      };
    }
    
    return null;
  };

  const findPlayerById = (playerId: string): User | null => {
    // Check available players first
    const availablePlayer = availablePlayers.find(p => p.id === playerId);
    if (availablePlayer) return availablePlayer;
    
    // Check forwards
    for (const line of lines.forwards) {
      if (line.leftWing?.id === playerId) return line.leftWing;
      if (line.center?.id === playerId) return line.center;
      if (line.rightWing?.id === playerId) return line.rightWing;
    }
    
    // Check defense
    for (const line of lines.defense) {
      if (line.leftDefense?.id === playerId) return line.leftDefense;
      if (line.rightDefense?.id === playerId) return line.rightDefense;
    }
    
    // Check goalies
    for (const goalie of lines.goalies) {
      if (goalie?.id === playerId) return goalie;
    }
    
    return null;
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;
    
    const parts = draggableId.split('-');
    const playerId = parts[0] === 'roster' ? parts.slice(1).join('-') : parts.slice(3).join('-');
    
    const sourceInfo = parseDroppableId(source.droppableId);
    const destInfo = parseDroppableId(destination.droppableId);
    
    if (!sourceInfo || !destInfo) {
      console.error('Invalid droppable ID format');
      return;
    }
    
    const player = findPlayerById(playerId);
    if (!player) {
      console.error(`Player with ID ${playerId} not found`);
      return;
    }
    
    const getValidLineType = (type: LineType): 'forwards' | 'defense' | 'goalies' => {
      if (type === 'available') return 'forwards';
      if (type === 'forwards' || type === 'defense' || type === 'goalies') return type;
      return 'forwards';
    };
    
    handlePlayerMove(
      player,
      getValidLineType(sourceInfo.lineType),
      sourceInfo.lineIndex,
      sourceInfo.position,
      getValidLineType(destInfo.lineType),
      destInfo.lineIndex,
      destInfo.position
    );
  };

  return { onDragEnd };
}
