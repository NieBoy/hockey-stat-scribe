
import React, { useState, useEffect } from "react";
import { Team, Lines, User, Position } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getTeamLineup, updateTeamLineup } from "@/services/teams/lineupManagement";
import { buildInitialLines } from "@/utils/lineupUtils";
import { NonDraggableLineupView } from "./NonDraggableLineupView";

interface SimpleLineupEditorProps {
  team: Team;
}

export function SimpleLineupEditor({ team }: SimpleLineupEditorProps) {
  const [lines, setLines] = useState<Lines>(() => buildInitialLines(team));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState<'forwards' | 'defense' | 'goalies'>('forwards');
  const [selectedLineIndex, setSelectedLineIndex] = useState<number>(0);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);

  // Load the current lineup on component mount
  useEffect(() => {
    const loadLineup = async () => {
      try {
        setIsLoading(true);
        console.log("SimpleLineupEditor - Loading lineup for team:", team.id);
        
        const lineupData = await getTeamLineup(team.id);
        console.log("SimpleLineupEditor - Lineup data loaded:", lineupData);
        
        if (lineupData && lineupData.length > 0) {
          // Apply positions from database to the team players
          const updatedTeam = {
            ...team,
            players: team.players.map(player => {
              const lineupPlayer = lineupData.find(lp => lp.user_id === player.id);
              if (lineupPlayer && lineupPlayer.position) {
                return {
                  ...player,
                  position: lineupPlayer.position,
                  lineNumber: lineupPlayer.line_number
                };
              }
              return player;
            })
          };
          
          const refreshedLines = buildInitialLines(updatedTeam);
          setLines(refreshedLines);
        }
      } catch (error) {
        console.error("SimpleLineupEditor - Error loading lineup:", error);
        toast.error("Failed to load lineup");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLineup();
  }, [team]);

  // Save the current lineup
  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log("SimpleLineupEditor - Saving lineup for team:", team.id);
      console.log("SimpleLineupEditor - Lines to save:", lines);
      
      const success = await updateTeamLineup(team.id, lines);
      
      if (success) {
        toast.success("Lineup saved successfully");
      } else {
        toast.error("Failed to save lineup");
      }
    } catch (error) {
      console.error("SimpleLineupEditor - Error saving lineup:", error);
      toast.error("An error occurred while saving lineup");
    } finally {
      setIsSaving(false);
    }
  };

  // Add a new forward line
  const addForwardLine = () => {
    const newLines = { ...lines };
    const newLineNumber = newLines.forwards.length > 0 
      ? Math.max(...newLines.forwards.map(line => line.lineNumber)) + 1 
      : 1;
    
    newLines.forwards.push({
      lineNumber: newLineNumber,
      leftWing: null,
      center: null,
      rightWing: null
    });
    
    setLines(newLines);
    toast.success(`Forward line ${newLineNumber} added`);
  };

  // Add a new defense line
  const addDefenseLine = () => {
    const newLines = { ...lines };
    const newLineNumber = newLines.defense.length > 0 
      ? Math.max(...newLines.defense.map(line => line.lineNumber)) + 1 
      : 1;
    
    newLines.defense.push({
      lineNumber: newLineNumber,
      leftDefense: null,
      rightDefense: null
    });
    
    setLines(newLines);
    toast.success(`Defense pair ${newLineNumber} added`);
  };

  // Delete a forward line
  const deleteForwardLine = (lineIndex: number) => {
    const newLines = { ...lines };
    newLines.forwards = newLines.forwards.filter((_, index) => index !== lineIndex);
    
    // Re-number remaining lines
    newLines.forwards = newLines.forwards.map((line, index) => ({
      ...line,
      lineNumber: index + 1
    }));
    
    setLines(newLines);
  };

  // Delete a defense line
  const defenseLine = (lineIndex: number) => {
    const newLines = { ...lines };
    newLines.defense = newLines.defense.filter((_, index) => index !== lineIndex);
    
    // Re-number remaining lines
    newLines.defense = newLines.defense.map((line, index) => ({
      ...line,
      lineNumber: index + 1
    }));
    
    setLines(newLines);
  };

  // Set a player to a specific position
  const assignPlayerToPosition = (playerId: string, position: Position | null) => {
    if (!position) return;
    
    const player = playerId === "none" ? null : team.players.find(p => p.id === playerId);
    const newLines = { ...lines };
    
    if (position.startsWith('LW') || position.startsWith('C') || position.startsWith('RW')) {
      const lineIndex = selectedLineIndex;
      const line = newLines.forwards[lineIndex];
      
      if (position.startsWith('LW')) line.leftWing = player;
      else if (position.startsWith('C')) line.center = player;
      else if (position.startsWith('RW')) line.rightWing = player;
    } 
    else if (position.startsWith('LD') || position.startsWith('RD')) {
      const lineIndex = selectedLineIndex;
      const line = newLines.defense[lineIndex];
      
      if (position.startsWith('LD')) line.leftDefense = player;
      else if (position.startsWith('RD')) line.rightDefense = player;
    } 
    else if (position === 'G') {
      const goalieIndex = selectedLineIndex;
      if (goalieIndex === 0) {
        if (player) {
          // Replace first goalie or add to empty array
          if (newLines.goalies.length > 0) {
            newLines.goalies[0] = player;
          } else {
            newLines.goalies = [player];
          }
        } else {
          // Remove first goalie
          newLines.goalies = newLines.goalies.filter((_, i) => i !== 0);
        }
      } else if (goalieIndex === 1) {
        if (player) {
          // Add as second goalie or ensure array has 2 elements
          if (newLines.goalies.length > 1) {
            newLines.goalies[1] = player;
          } else if (newLines.goalies.length === 1) {
            newLines.goalies.push(player);
          } else {
            newLines.goalies = [null, player];
          }
        } else {
          // Remove second goalie if it exists
          if (newLines.goalies.length > 1) {
            newLines.goalies = [newLines.goalies[0]];
          }
        }
      }
    }
    
    setLines(newLines);
  };

  // Get available players that aren't already in the lineup
  const getAvailablePlayers = () => {
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
      if (goalie) assignedPlayerIds.add(goalie.id);
    });
    
    // Get currently selected player to exclude from the set
    if (selectedPosition && selectedLineIndex !== undefined) {
      let currentPlayer: User | null = null;
      
      if (currentTab === 'forwards') {
        const line = lines.forwards[selectedLineIndex];
        if (selectedPosition === 'LW') currentPlayer = line.leftWing;
        else if (selectedPosition === 'C') currentPlayer = line.center;
        else if (selectedPosition === 'RW') currentPlayer = line.rightWing;
      }
      else if (currentTab === 'defense') {
        const line = lines.defense[selectedLineIndex];
        if (selectedPosition === 'LD') currentPlayer = line.leftDefense;
        else if (selectedPosition === 'RD') currentPlayer = line.rightDefense;
      }
      else if (currentTab === 'goalies' && selectedPosition === 'G') {
        currentPlayer = lines.goalies[selectedLineIndex] || null;
      }
      
      // Remove current player from the set so it shows in the dropdown
      if (currentPlayer) {
        assignedPlayerIds.delete(currentPlayer.id);
      }
    }
    
    // Return all players not already assigned
    return team.players.filter(player => !assignedPlayerIds.has(player.id));
  };

  const handlePositionSelect = (lineIndex: number, position: Position) => {
    setSelectedLineIndex(lineIndex);
    setSelectedPosition(position);
  };

  const renderForwardsTab = () => {
    return (
      <div className="space-y-4">
        {lines.forwards.map((line, index) => (
          <Card key={`forward-line-${index}`} className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Forward Line {line.lineNumber}</CardTitle>
                {lines.forwards.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={() => deleteForwardLine(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium mb-1">Left Wing</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start mb-2"
                    onClick={() => handlePositionSelect(index, 'LW')}
                  >
                    {line.leftWing?.name || 'Select LW'}
                  </Button>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Center</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start mb-2"
                    onClick={() => handlePositionSelect(index, 'C')}
                  >
                    {line.center?.name || 'Select C'}
                  </Button>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Right Wing</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start mb-2"
                    onClick={() => handlePositionSelect(index, 'RW')}
                  >
                    {line.rightWing?.name || 'Select RW'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button 
          variant="outline" 
          onClick={addForwardLine}
          className="w-full flex items-center gap-2 justify-center"
        >
          <PlusCircle className="h-4 w-4" />
          Add Forward Line
        </Button>
      </div>
    );
  };

  const renderDefenseTab = () => {
    return (
      <div className="space-y-4">
        {lines.defense.map((pair, index) => (
          <Card key={`defense-pair-${index}`} className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Defense Pair {pair.lineNumber}</CardTitle>
                {lines.defense.length > 1 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500"
                    onClick={() => defenseLine(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium mb-1">Left Defense</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start mb-2"
                    onClick={() => handlePositionSelect(index, 'LD')}
                  >
                    {pair.leftDefense?.name || 'Select LD'}
                  </Button>
                </div>
                <div>
                  <p className="text-xs font-medium mb-1">Right Defense</p>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start mb-2"
                    onClick={() => handlePositionSelect(index, 'RD')}
                  >
                    {pair.rightDefense?.name || 'Select RD'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        <Button 
          variant="outline" 
          onClick={addDefenseLine}
          className="w-full flex items-center gap-2 justify-center"
        >
          <PlusCircle className="h-4 w-4" />
          Add Defense Pair
        </Button>
      </div>
    );
  };

  const renderGoaliesTab = () => {
    const goalie1 = lines.goalies[0] || null;
    const goalie2 = lines.goalies[1] || null;
    
    return (
      <div className="space-y-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Goalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium mb-1">Starting Goalie</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => handlePositionSelect(0, 'G')}
                >
                  {goalie1?.name || 'Select Goalie'}
                </Button>
              </div>
              <div>
                <p className="text-xs font-medium mb-1">Backup Goalie</p>
                <Button 
                  variant="outline" 
                  className="w-full justify-start mb-2"
                  onClick={() => handlePositionSelect(1, 'G')}
                >
                  {goalie2?.name || 'Select Goalie'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Player selection modal
  const renderPlayerSelectionModal = () => {
    if (selectedPosition === null) return null;
    
    const availablePlayers = getAvailablePlayers();
    
    let currentPlayer: User | null = null;
    if (currentTab === 'forwards') {
      const line = lines.forwards[selectedLineIndex];
      if (selectedPosition === 'LW') currentPlayer = line.leftWing;
      else if (selectedPosition === 'C') currentPlayer = line.center;
      else if (selectedPosition === 'RW') currentPlayer = line.rightWing;
    }
    else if (currentTab === 'defense') {
      const line = lines.defense[selectedLineIndex];
      if (selectedPosition === 'LD') currentPlayer = line.leftDefense;
      else if (selectedPosition === 'RD') currentPlayer = line.rightDefense;
    }
    else if (currentTab === 'goalies' && selectedPosition === 'G') {
      currentPlayer = lines.goalies[selectedLineIndex] || null;
    }
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>
            Select Player for {selectedPosition}
            {currentTab !== 'goalies' && ` - Line ${selectedLineIndex + 1}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={currentPlayer?.id || "none"} 
            onValueChange={(playerId) => {
              assignPlayerToPosition(playerId, selectedPosition);
              setSelectedPosition(null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {currentPlayer && (
                <SelectItem key={currentPlayer.id} value={currentPlayer.id}>
                  {currentPlayer.name} (Current)
                </SelectItem>
              )}
              {availablePlayers.map(player => (
                <SelectItem key={player.id} value={player.id}>{player.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={() => setSelectedPosition(null)}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading lineup...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Team Lineup Editor</CardTitle>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : 'Save Lineup'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tab navigation */}
          <div className="flex border-b mb-4">
            <button
              className={`px-4 py-2 ${currentTab === 'forwards' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('forwards')}
            >
              Forwards
            </button>
            <button
              className={`px-4 py-2 ${currentTab === 'defense' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('defense')}
            >
              Defense
            </button>
            <button
              className={`px-4 py-2 ${currentTab === 'goalies' ? 'border-b-2 border-primary font-medium' : ''}`}
              onClick={() => setCurrentTab('goalies')}
            >
              Goalies
            </button>
          </div>

          {/* Content based on selected tab */}
          <div className="mt-4">
            {currentTab === 'forwards' && renderForwardsTab()}
            {currentTab === 'defense' && renderDefenseTab()}
            {currentTab === 'goalies' && renderGoaliesTab()}
            
            {/* Player selection dialog */}
            {renderPlayerSelectionModal()}
          </div>
        </CardContent>
      </Card>

      {/* Preview of the current lineup */}
      <Card>
        <CardHeader>
          <CardTitle>Current Lineup</CardTitle>
        </CardHeader>
        <CardContent>
          <NonDraggableLineupView lines={lines} />
        </CardContent>
      </Card>
    </div>
  );
}
