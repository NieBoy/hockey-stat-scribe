import { useState, useEffect } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { Team, User, Lines, Position } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ForwardLinesSection } from '@/components/events/player-lines/ForwardLinesSection';
import { DefensePairsSection } from '@/components/events/player-lines/DefensePairsSection';
import { GoaliesSection } from '@/components/events/player-lines/GoaliesSection';
import { PlayerCard } from '@/components/events/player-lines/PlayerCard';
import { Droppable } from '@hello-pangea/dnd';
import { useLineupEditor } from '@/hooks/useLineupEditor';

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
    
    // Parse the draggable ID to get player details
    // Format: [type]-[lineNumber]-[position]-[playerId]
    const parts = draggableId.split('-');
    const playerType = parts[0];
    const lineNumber = parseInt(parts[1], 10);
    const position = parts[2] as Position;
    const playerId = parts.slice(3).join('-'); // In case player ID contains hyphens
    
    // Parse destination ID to get drop details
    // Format: [type]-[lineNumber]
    const destParts = destination.droppableId.split('-');
    const destType = destParts[0];
    const destLineNumber = destParts.length > 1 ? parseInt(destParts[1], 10) : 0;
    
    // Handle drops into roster
    if (destination.droppableId === 'roster') {
      handlePlayerMove({
        playerId,
        sourceType: playerType as 'forward' | 'defense' | 'goalie',
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

    // Move player to new position
    if (destPosition) {
      handlePlayerMove({
        playerId,
        sourceType: playerType as 'forward' | 'defense' | 'goalie', 
        sourceLineNumber: lineNumber,
        sourcePosition: position,
        destType: destType as 'forward' | 'defense' | 'goalie' | 'pp' | 'pk',
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
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Available Players</CardTitle>
            </CardHeader>
            <CardContent>
              <Droppable droppableId="roster" direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2"
                  >
                    {availablePlayers.map((player, index) => (
                      <div key={player.id} className="col-span-1">
                        <PlayerCard
                          player={player}
                          position={player.position || 'Player'}
                          isSelected={false}
                          isDraggable={true}
                          index={index}
                          dragId={`roster-0-P-${player.id}`}
                        />
                      </div>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CardContent>
          </Card>
          
          <TabsContent value="even-strength">
            <div className="space-y-6">
              <ForwardLinesSection
                forwardLines={lines.forwards}
                isDraggable={true}
              />
              
              <Button 
                variant="outline" 
                onClick={addForwardLine} 
                className="mt-2 w-full"
              >
                Add Forward Line
              </Button>
              
              <DefensePairsSection
                defensePairs={lines.defense}
                isDraggable={true}
              />
              
              <Button 
                variant="outline" 
                onClick={addDefenseLine} 
                className="mt-2 w-full"
              >
                Add Defense Pair
              </Button>

              <GoaliesSection 
                goalies={lines.goalies}
                isDraggable={true}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="power-play">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Power Play Units</CardTitle>
                </CardHeader>
                <CardContent>
                  {[1, 2].map((unitNumber) => (
                    <div key={`pp-${unitNumber}`} className="mb-6">
                      <h4 className="text-sm font-medium mb-2">PP Unit {unitNumber}</h4>
                      <Droppable droppableId={`pp-${unitNumber}`} direction="horizontal">
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="grid grid-cols-5 gap-2"
                          >
                            {['LW', 'C', 'RW', 'LD', 'RD'].map((pos, idx) => (
                              <div key={pos}>
                                <PlayerCard
                                  player={null}
                                  position={pos}
                                  isSelected={false}
                                />
                              </div>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="penalty-kill">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Penalty Kill Units</CardTitle>
                </CardHeader>
                <CardContent>
                  {[1, 2].map((unitNumber) => (
                    <div key={`pk-${unitNumber}`} className="mb-6">
                      <h4 className="text-sm font-medium mb-2">PK Unit {unitNumber}</h4>
                      <Droppable droppableId={`pk-${unitNumber}`} direction="horizontal">
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="grid grid-cols-4 gap-2"
                          >
                            {['LF', 'RF', 'LD', 'RD'].map((pos, idx) => (
                              <div key={pos}>
                                <PlayerCard
                                  player={null}
                                  position={pos}
                                  isSelected={false}
                                />
                              </div>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DragDropContext>
  );
}
