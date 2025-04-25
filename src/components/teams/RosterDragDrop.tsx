
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
    
    // Extract the necessary source and destination information
    const sourceInfo = parseDroppableId(source.droppableId);
    const destInfo = parseDroppableId(destination.droppableId);
    
    if (sourceInfo && destInfo) {
      // Find the player object from availablePlayers or lines
      let player: User | null = findPlayerById(playerId, availablePlayers, lines);
      
      if (player) {
        // Handle the case where source is "available-players" - ensure we use valid type
        const sourceLineType = sourceInfo.lineType === 'available' 
          ? 'forwards' as const
          : sourceInfo.lineType;
          
        const destLineType = destInfo.lineType === 'available' 
          ? 'forwards' as const 
          : destInfo.lineType;
        
        handlePlayerMove(
          player,
          sourceLineType,
          sourceInfo.lineIndex,
          sourceInfo.position,
          destLineType,
          destInfo.lineIndex,
          destInfo.position
        );
        
        toast.success('Player position updated');
      } else {
        console.error(`Player with ID ${playerId} not found`);
      }
    } else {
      console.error('Invalid droppable ID format');
    }
  };
  
  // Helper function to parse the droppable ID format
  function parseDroppableId(droppableId: string) {
    // Example format: "forward-line-0-LW" or "defense-line-1-RD" or "available-players"
    const parts = droppableId.split('-');
    
    // Handle available players section
    if (droppableId === 'available-players') {
      return {
        lineType: 'available',
        lineIndex: 0,
        position: 'available'
      };
    }
    
    // Handle lineup positions
    if (parts.length >= 4) {
      const lineTypeStr = parts[0];
      let lineType: 'forwards' | 'defense' | 'goalies' | 'available';
      
      if (lineTypeStr === 'forward') {
        lineType = 'forwards';
      } else if (lineTypeStr === 'defense') {
        lineType = 'defense';
      } else if (lineTypeStr === 'goalie') {
        lineType = 'goalies';
      } else {
        return null; // Invalid line type
      }
      
      return {
        lineType,
        lineIndex: parseInt(parts[2], 10),
        position: parts[3]
      };
    }
    
    return null;
  }
  
  // Helper function to find a player by ID from available players or lines
  function findPlayerById(playerId: string, availablePlayers: User[], lines: Lines): User | null {
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
  }

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
