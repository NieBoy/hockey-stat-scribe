
import { useState } from "react";
import { Team, Lines, User, Position, ForwardLine, DefenseLine } from "@/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

export interface TeamLineupEditorProps {
  team: Team;
  onSaveLineup: (lines: Lines) => Promise<void>;
  isSaving?: boolean;
}

const TeamLineupEditor = ({ team, onSaveLineup, isSaving = false }: TeamLineupEditorProps) => {
  // Initialize lines with existing player positions
  const initialLines = buildInitialLines(team);
  const [lines, setLines] = useState<Lines>(initialLines);
  
  // Available players for selection (not already assigned)
  const [availablePlayers, setAvailablePlayers] = useState<User[]>(
    getAvailablePlayers(team, initialLines)
  );

  const handlePlayerSelect = (
    lineType: 'forwards' | 'defense' | 'goalies',
    lineIndex: number,
    position: Position,
    playerId: string
  ) => {
    // Deep copy lines to avoid direct state mutation
    const newLines = { ...lines };
    
    // Handle player removal from current position first
    let playerToMove: User | null = null;
    
    // Find player in team
    const player = team.players.find(p => p.id === playerId);
    
    if (!player) return;
    
    if (playerId === '') {
      // Handle removing a player (empty selection)
      if (lineType === 'forwards') {
        const line = newLines.forwards[lineIndex];
        if (position === 'LW' && line.leftWing) {
          playerToMove = line.leftWing;
          line.leftWing = null;
        } else if (position === 'C' && line.center) {
          playerToMove = line.center;
          line.center = null;
        } else if (position === 'RW' && line.rightWing) {
          playerToMove = line.rightWing;
          line.rightWing = null;
        }
      } else if (lineType === 'defense') {
        const line = newLines.defense[lineIndex];
        if (position === 'LD' && line.leftDefense) {
          playerToMove = line.leftDefense;
          line.leftDefense = null;
        } else if (position === 'RD' && line.rightDefense) {
          playerToMove = line.rightDefense;
          line.rightDefense = null;
        }
      } else if (lineType === 'goalies') {
        const removedPlayer = newLines.goalies.find(g => g.id === playerId);
        newLines.goalies = newLines.goalies.filter(g => g.id !== playerId);
        if (removedPlayer) playerToMove = removedPlayer;
      }
    } else {
      // Find if this player is already assigned somewhere
      removePlayerFromCurrentPosition(playerId, newLines);
      
      // Add player to new position
      if (lineType === 'forwards') {
        const line = newLines.forwards[lineIndex];
        if (position === 'LW') {
          // If there is already a player in this position, add them back to available
          if (line.leftWing) setAvailablePlayers([...availablePlayers, line.leftWing]);
          line.leftWing = { ...player, position: 'LW', lineNumber: lineIndex + 1 };
        } else if (position === 'C') {
          if (line.center) setAvailablePlayers([...availablePlayers, line.center]);
          line.center = { ...player, position: 'C', lineNumber: lineIndex + 1 };
        } else if (position === 'RW') {
          if (line.rightWing) setAvailablePlayers([...availablePlayers, line.rightWing]);
          line.rightWing = { ...player, position: 'RW', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'defense') {
        const line = newLines.defense[lineIndex];
        if (position === 'LD') {
          if (line.leftDefense) setAvailablePlayers([...availablePlayers, line.leftDefense]);
          line.leftDefense = { ...player, position: 'LD', lineNumber: lineIndex + 1 };
        } else if (position === 'RD') {
          if (line.rightDefense) setAvailablePlayers([...availablePlayers, line.rightDefense]);
          line.rightDefense = { ...player, position: 'RD', lineNumber: lineIndex + 1 };
        }
      } else if (lineType === 'goalies') {
        newLines.goalies = [...newLines.goalies, { ...player, position: 'G' }];
      }
      
      // Remove player from available list
      setAvailablePlayers(availablePlayers.filter(p => p.id !== playerId));
    }
    
    // If we removed a player, add them back to available players
    if (playerToMove) {
      setAvailablePlayers([...availablePlayers, playerToMove]);
    }
    
    setLines(newLines);
  };
  
  // Helper function to remove a player from current position
  const removePlayerFromCurrentPosition = (playerId: string, lines: Lines) => {
    // Check forwards
    for (let i = 0; i < lines.forwards.length; i++) {
      const line = lines.forwards[i];
      if (line.leftWing?.id === playerId) line.leftWing = null;
      if (line.center?.id === playerId) line.center = null;
      if (line.rightWing?.id === playerId) line.rightWing = null;
    }
    
    // Check defense
    for (let i = 0; i < lines.defense.length; i++) {
      const line = lines.defense[i];
      if (line.leftDefense?.id === playerId) line.leftDefense = null;
      if (line.rightDefense?.id === playerId) line.rightDefense = null;
    }
    
    // Check goalies
    lines.goalies = lines.goalies.filter(g => g.id !== playerId);
  };

  const handleSaveLineup = async () => {
    await onSaveLineup(lines);
  };

  const addForwardLine = () => {
    const newLines = { ...lines };
    newLines.forwards.push({
      lineNumber: newLines.forwards.length + 1,
      leftWing: null,
      center: null,
      rightWing: null
    });
    setLines(newLines);
  };

  const addDefenseLine = () => {
    const newLines = { ...lines };
    newLines.defense.push({
      lineNumber: newLines.defense.length + 1,
      leftDefense: null,
      rightDefense: null
    });
    setLines(newLines);
  };

  return (
    <Tabs defaultValue="forwards" className="w-full">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="forwards">Forwards</TabsTrigger>
        <TabsTrigger value="defense">Defense</TabsTrigger>
        <TabsTrigger value="goalies">Goalies</TabsTrigger>
      </TabsList>
      
      <TabsContent value="forwards">
        <div className="space-y-4">
          {lines.forwards.map((line, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Line {line.lineNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Left Wing</p>
                    <Select 
                      value={line.leftWing?.id || ''} 
                      onValueChange={(value) => handlePlayerSelect('forwards', index, 'LW', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                        {line.leftWing && (
                          <SelectItem value={line.leftWing.id}>
                            {line.leftWing.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Center</p>
                    <Select 
                      value={line.center?.id || ''} 
                      onValueChange={(value) => handlePlayerSelect('forwards', index, 'C', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                        {line.center && (
                          <SelectItem value={line.center.id}>
                            {line.center.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Right Wing</p>
                    <Select 
                      value={line.rightWing?.id || ''} 
                      onValueChange={(value) => handlePlayerSelect('forwards', index, 'RW', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                        {line.rightWing && (
                          <SelectItem value={line.rightWing.id}>
                            {line.rightWing.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-1"
            onClick={addForwardLine}
          >
            <PlusCircle className="h-4 w-4" /> Add Forward Line
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="defense">
        <div className="space-y-4">
          {lines.defense.map((line, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Pair {line.lineNumber}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium mb-1">Left Defense</p>
                    <Select 
                      value={line.leftDefense?.id || ''} 
                      onValueChange={(value) => handlePlayerSelect('defense', index, 'LD', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                        {line.leftDefense && (
                          <SelectItem value={line.leftDefense.id}>
                            {line.leftDefense.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Right Defense</p>
                    <Select 
                      value={line.rightDefense?.id || ''} 
                      onValueChange={(value) => handlePlayerSelect('defense', index, 'RD', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select player" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {availablePlayers.map((player) => (
                          <SelectItem key={player.id} value={player.id}>
                            {player.name}
                          </SelectItem>
                        ))}
                        {line.rightDefense && (
                          <SelectItem value={line.rightDefense.id}>
                            {line.rightDefense.name}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-1"
            onClick={addDefenseLine}
          >
            <PlusCircle className="h-4 w-4" /> Add Defense Pair
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="goalies">
        <Card>
          <CardHeader>
            <CardTitle>Goalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lines.goalies.map((goalie, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>{goalie.name}</div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handlePlayerSelect('goalies', 0, 'G', goalie.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              
              {availablePlayers.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-1">Add Goalie</p>
                  <Select 
                    onValueChange={(value) => handlePlayerSelect('goalies', 0, 'G', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      
      <div className="mt-6">
        <Button 
          onClick={handleSaveLineup} 
          className="w-full"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">○</span>
              Saving Lineup...
            </>
          ) : (
            "Save Lineup"
          )}
        </Button>
      </div>
    </Tabs>
  );
};

// Helper functions to initialize lines from team data
function buildInitialLines(team: Team): Lines {
  const forwards: ForwardLine[] = [];
  const defense: DefenseLine[] = [];
  const goalies: User[] = [];
  
  // Find all players with positions and their line numbers
  team.players.forEach(player => {
    if (!player.position) return;
    
    if (player.position === 'LW' || player.position === 'C' || player.position === 'RW') {
      const lineNumber = player.lineNumber || 1;
      let line = forwards.find(l => l.lineNumber === lineNumber);
      
      if (!line) {
        line = { lineNumber, leftWing: null, center: null, rightWing: null };
        forwards.push(line);
      }
      
      if (player.position === 'LW') line.leftWing = player;
      if (player.position === 'C') line.center = player;
      if (player.position === 'RW') line.rightWing = player;
    } 
    else if (player.position === 'LD' || player.position === 'RD') {
      const lineNumber = player.lineNumber || 1;
      let line = defense.find(l => l.lineNumber === lineNumber);
      
      if (!line) {
        line = { lineNumber, leftDefense: null, rightDefense: null };
        defense.push(line);
      }
      
      if (player.position === 'LD') line.leftDefense = player;
      if (player.position === 'RD') line.rightDefense = player;
    }
    else if (player.position === 'G') {
      goalies.push(player);
    }
  });
  
  // Sort lines by line number
  forwards.sort((a, b) => a.lineNumber - b.lineNumber);
  defense.sort((a, b) => a.lineNumber - b.lineNumber);
  
  // Ensure at least one line for each type
  if (forwards.length === 0) {
    forwards.push({ lineNumber: 1, leftWing: null, center: null, rightWing: null });
  }
  
  if (defense.length === 0) {
    defense.push({ lineNumber: 1, leftDefense: null, rightDefense: null });
  }
  
  return { forwards, defense, goalies };
}

function getAvailablePlayers(team: Team, lines: Lines): User[] {
  // Create a set of all player IDs already in lines
  const assignedPlayerIds = new Set<string>();
  
  // Add all players from forwards
  lines.forwards.forEach(line => {
    if (line.leftWing) assignedPlayerIds.add(line.leftWing.id);
    if (line.center) assignedPlayerIds.add(line.center.id);
    if (line.rightWing) assignedPlayerIds.add(line.rightWing.id);
  });
  
  // Add all players from defense
  lines.defense.forEach(line => {
    if (line.leftDefense) assignedPlayerIds.add(line.leftDefense.id);
    if (line.rightDefense) assignedPlayerIds.add(line.rightDefense.id);
  });
  
  // Add all goalies
  lines.goalies.forEach(goalie => {
    assignedPlayerIds.add(goalie.id);
  });
  
  // Return all players not already assigned
  return team.players.filter(player => !assignedPlayerIds.has(player.id));
}

export default TeamLineupEditor;
