import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Team, User, Position, ForwardLine, DefenseLine, Lines } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface TeamLineupEditorProps {
  team: Team;
  onSaveLineup: (lines: Lines) => void;
}

export default function TeamLineupEditor({ team, onSaveLineup }: TeamLineupEditorProps) {
  const [lines, setLines] = useState<Lines>({
    forwards: [{ lineNumber: 1, leftWing: null, center: null, rightWing: null }],
    defense: [{ lineNumber: 1, leftDefense: null, rightDefense: null }],
    goalies: []
  });
  
  const [unassignedPlayers, setUnassignedPlayers] = useState<User[]>([]);

  useEffect(() => {
    if (team.lines) {
      setLines(team.lines);
      
      const assignedPlayerIds = new Set<string>();
      
      team.lines.forwards.forEach(line => {
        if (line.leftWing) assignedPlayerIds.add(line.leftWing.id);
        if (line.center) assignedPlayerIds.add(line.center.id);
        if (line.rightWing) assignedPlayerIds.add(line.rightWing.id);
      });
      
      team.lines.defense.forEach(line => {
        if (line.leftDefense) assignedPlayerIds.add(line.leftDefense.id);
        if (line.rightDefense) assignedPlayerIds.add(line.rightDefense.id);
      });
      
      team.lines.goalies.forEach(goalie => {
        assignedPlayerIds.add(goalie.id);
      });
      
      setUnassignedPlayers(team.players.filter(player => !assignedPlayerIds.has(player.id)));
    } else {
      setUnassignedPlayers(team.players);
    }
  }, [team]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) return;
    
    if (source.droppableId === 'unassigned' && destination.droppableId !== 'unassigned') {
      const [destType, destLine, destPosition] = destination.droppableId.split('-');
      const playerIndex = source.index;
      const player = unassignedPlayers[playerIndex];
      
      const newUnassignedPlayers = [...unassignedPlayers];
      newUnassignedPlayers.splice(playerIndex, 1);
      setUnassignedPlayers(newUnassignedPlayers);
      
      addPlayerToPosition(player, destType, parseInt(destLine), destPosition as Position);
    } 
    else if (source.droppableId !== 'unassigned' && destination.droppableId === 'unassigned') {
      const [sourceType, sourceLine, sourcePosition] = source.droppableId.split('-');
      const player = getPlayerFromPosition(sourceType, parseInt(sourceLine), sourcePosition as Position);
      
      if (player) {
        removePlayerFromPosition(sourceType, parseInt(sourceLine), sourcePosition as Position);
        setUnassignedPlayers([...unassignedPlayers, player]);
      }
    }
    else if (source.droppableId !== 'unassigned' && destination.droppableId !== 'unassigned' && 
             source.droppableId !== destination.droppableId) {
      const [sourceType, sourceLine, sourcePosition] = source.droppableId.split('-');
      const [destType, destLine, destPosition] = destination.droppableId.split('-');
      const player = getPlayerFromPosition(sourceType, parseInt(sourceLine), sourcePosition as Position);
      
      if (player) {
        removePlayerFromPosition(sourceType, parseInt(sourceLine), sourcePosition as Position);
        addPlayerToPosition(player, destType, parseInt(destLine), destPosition as Position);
      }
    }
  };

  const getPlayerFromPosition = (
    type: string, 
    lineNumber: number, 
    position: Position
  ): User | null => {
    if (type === 'forward') {
      const line = lines.forwards.find(l => l.lineNumber === lineNumber);
      if (!line) return null;
      
      if (position === 'LW') return line.leftWing;
      if (position === 'C') return line.center;
      if (position === 'RW') return line.rightWing;
    } 
    else if (type === 'defense') {
      const line = lines.defense.find(l => l.lineNumber === lineNumber);
      if (!line) return null;
      
      if (position === 'LD') return line.leftDefense;
      if (position === 'RD') return line.rightDefense;
    }
    else if (type === 'goalie' && position === 'G') {
      const index = lineNumber - 1;
      if (index >= 0 && index < lines.goalies.length) {
        return lines.goalies[index];
      }
    }
    
    return null;
  };

  const removePlayerFromPosition = (
    type: string, 
    lineNumber: number, 
    position: Position
  ) => {
    setLines(prevLines => {
      const newLines = { ...prevLines };
      
      if (type === 'forward') {
        newLines.forwards = newLines.forwards.map(line => {
          if (line.lineNumber === lineNumber) {
            if (position === 'LW') return { ...line, leftWing: null };
            if (position === 'C') return { ...line, center: null };
            if (position === 'RW') return { ...line, rightWing: null };
          }
          return line;
        });
      } 
      else if (type === 'defense') {
        newLines.defense = newLines.defense.map(line => {
          if (line.lineNumber === lineNumber) {
            if (position === 'LD') return { ...line, leftDefense: null };
            if (position === 'RD') return { ...line, rightDefense: null };
          }
          return line;
        });
      }
      else if (type === 'goalie' && position === 'G') {
        const index = lineNumber - 1;
        if (index >= 0 && index < newLines.goalies.length) {
          newLines.goalies.splice(index, 1);
        }
      }
      
      return newLines;
    });
  };

  const addPlayerToPosition = (
    player: User,
    type: string,
    lineNumber: number,
    position: Position
  ) => {
    setLines(prevLines => {
      const newLines = { ...prevLines };
      
      if (type === 'forward') {
        newLines.forwards = newLines.forwards.map(line => {
          if (line.lineNumber === lineNumber) {
            if (position === 'LW') return { ...line, leftWing: player };
            if (position === 'C') return { ...line, center: player };
            if (position === 'RW') return { ...line, rightWing: player };
          }
          return line;
        });
      } 
      else if (type === 'defense') {
        newLines.defense = newLines.defense.map(line => {
          if (line.lineNumber === lineNumber) {
            if (position === 'LD') return { ...line, leftDefense: player };
            if (position === 'RD') return { ...line, rightDefense: player };
          }
          return line;
        });
      }
      else if (type === 'goalie' && position === 'G') {
        newLines.goalies.push(player);
      }
      
      return newLines;
    });
  };

  const addForwardLine = () => {
    const newLineNumber = lines.forwards.length + 1;
    setLines(prev => ({
      ...prev,
      forwards: [
        ...prev.forwards,
        { lineNumber: newLineNumber, leftWing: null, center: null, rightWing: null }
      ]
    }));
  };

  const addDefenseLine = () => {
    const newLineNumber = lines.defense.length + 1;
    setLines(prev => ({
      ...prev,
      defense: [
        ...prev.defense, 
        { lineNumber: newLineNumber, leftDefense: null, rightDefense: null }
      ]
    }));
  };

  const handleSaveLineup = () => {
    onSaveLineup(lines);
    toast.success("Team lineup has been saved successfully");
  };

  const renderPlayerItem = (player: User | null, index: number) => {
    if (!player) {
      return (
        <div className="bg-muted/40 border border-dashed border-muted-foreground/30 rounded-md h-20 flex items-center justify-center text-sm text-muted-foreground">
          Drop player here
        </div>
      );
    }
    
    return (
      <Draggable draggableId={player.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="bg-white border rounded-md p-3 mb-2 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <Link 
                to={`/players/${player.id}`} 
                className="font-medium hover:underline"
              >
                {player.name}
              </Link>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                {typeof player.position === 'string' ? player.position : 'N/A'}
              </span>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">{team.name} - Lineup Editor</h2>
          <Button onClick={handleSaveLineup} className="gap-2">
            <Save className="h-4 w-4" />
            Save Lineup
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Unassigned Players</CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="unassigned">
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="min-h-[12rem] bg-muted/30 rounded-md p-2"
                    >
                      {unassignedPlayers.map((player, index) => (
                        <Draggable key={player.id} draggableId={player.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white border rounded-md p-3 mb-2 shadow-sm"
                            >
                              <div className="font-medium">{player.name}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-blue-50 border-4 border-blue-200 rounded-lg p-4 relative min-h-[600px]">
              <div className="grid gap-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Forward Lines</h3>
                    <Button size="sm" variant="outline" onClick={addForwardLine} className="gap-1">
                      <PlusCircle className="h-4 w-4" /> Add Line
                    </Button>
                  </div>
                  
                  {lines.forwards.map((line, lineIdx) => (
                    <div key={line.lineNumber} className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs font-medium mb-1 text-center">
                          Left Wing (Line {line.lineNumber})
                        </div>
                        <Droppable droppableId={`forward-${line.lineNumber}-LW`}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="min-h-[5rem]"
                            >
                              {renderPlayerItem(line.leftWing, 0)}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium mb-1 text-center">
                          Center (Line {line.lineNumber})
                        </div>
                        <Droppable droppableId={`forward-${line.lineNumber}-C`}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="min-h-[5rem]"
                            >
                              {renderPlayerItem(line.center, 0)}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium mb-1 text-center">
                          Right Wing (Line {line.lineNumber})
                        </div>
                        <Droppable droppableId={`forward-${line.lineNumber}-RW`}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="min-h-[5rem]"
                            >
                              {renderPlayerItem(line.rightWing, 0)}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Defense Pairs</h3>
                    <Button size="sm" variant="outline" onClick={addDefenseLine} className="gap-1">
                      <PlusCircle className="h-4 w-4" /> Add Pair
                    </Button>
                  </div>
                  
                  {lines.defense.map((line, lineIdx) => (
                    <div key={line.lineNumber} className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-medium mb-1 text-center">
                          Left Defense (Pair {line.lineNumber})
                        </div>
                        <Droppable droppableId={`defense-${line.lineNumber}-LD`}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="min-h-[5rem]"
                            >
                              {renderPlayerItem(line.leftDefense, 0)}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium mb-1 text-center">
                          Right Defense (Pair {line.lineNumber})
                        </div>
                        <Droppable droppableId={`defense-${line.lineNumber}-RD`}>
                          {(provided) => (
                            <div 
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="min-h-[5rem]"
                            >
                              {renderPlayerItem(line.rightDefense, 0)}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Goalies</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium mb-1 text-center">
                        Starting Goalie
                      </div>
                      <Droppable droppableId={`goalie-1-G`}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="min-h-[5rem]"
                          >
                            {lines.goalies.length > 0 
                              ? renderPlayerItem(lines.goalies[0], 0)
                              : <div className="bg-muted/40 border border-dashed border-muted-foreground/30 rounded-md h-20 flex items-center justify-center text-sm text-muted-foreground">
                                  Drop player here
                                </div>
                            }
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                    
                    <div>
                      <div className="text-xs font-medium mb-1 text-center">
                        Backup Goalie
                      </div>
                      <Droppable droppableId={`goalie-2-G`}>
                        {(provided) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="min-h-[5rem]"
                          >
                            {lines.goalies.length > 1 
                              ? renderPlayerItem(lines.goalies[1], 0)
                              : <div className="bg-muted/40 border border-dashed border-muted-foreground/30 rounded-md h-20 flex items-center justify-center text-sm text-muted-foreground">
                                  Drop player here
                                </div>
                            }
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
}
