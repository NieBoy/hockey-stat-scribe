
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lines, Team, Position, User } from "@/types";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import { useAutoSaveLineup } from "@/hooks/lineup/useAutoSaveLineup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { PlayerPositionSelector } from "./components/PlayerPositionSelector";
import { NonDraggableLineupView } from "./NonDraggableLineupView";

interface ImprovedLineupEditorProps {
  team: Team;
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
}

export function ImprovedLineupEditor({ team, onSaveLineup }: ImprovedLineupEditorProps) {
  const {
    lines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    deleteForwardLine,
    deleteDefenseLine,
    refreshLineupData
  } = useLineupEditor(team);

  const [currentTab, setCurrentTab] = useState<'forwards' | 'defense' | 'goalies'>('forwards');

  // Setup auto-saving
  const { 
    saveStatus, 
    isSaving, 
    forceSave 
  } = useAutoSaveLineup({
    lines,
    onSaveLineup,
    autoSaveDelay: 1500 // 1.5 seconds delay before auto-save
  });

  // Helper for handling player selection
  const handlePositionSelect = (
    lineType: 'forwards' | 'defense' | 'goalies',
    lineIndex: number,
    position: Position,
    playerId: string
  ) => {
    console.log(`Selecting player: ${playerId} for ${lineType}, line ${lineIndex}, position ${position}`);
    
    try {
      handlePlayerSelect(lineType, lineIndex, position, playerId);
      console.log("Player selection successful");
    } catch (error) {
      console.error("Error selecting player:", error);
      toast.error("Failed to select player");
    }
  };

  // Get save status icon
  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Team Lineup</h3>
            <span className="text-sm text-muted-foreground">
              {saveStatus === 'idle' ? 'All changes saved' : 
              saveStatus === 'saving' ? 'Saving...' : 
              saveStatus === 'success' ? 'Saved!' : 
              saveStatus === 'error' ? 'Save failed' : ''}
            </span>
            {getSaveStatusIcon()}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshLineupData}
              className="gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={forceSave}
              disabled={isSaving || saveStatus === 'success'}
              className="gap-1"
            >
              Save Now
            </Button>
          </div>
        </div>
        
        <CardContent className="pt-6">
          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="forwards">Forwards</TabsTrigger>
              <TabsTrigger value="defense">Defense</TabsTrigger>
              <TabsTrigger value="goalies">Goalies</TabsTrigger>
            </TabsList>
            
            <TabsContent value="forwards" className="space-y-4">
              {lines.forwards.map((line, index) => (
                <Card key={`forward-line-${index}`} className="overflow-hidden">
                  <div className="flex justify-between items-center bg-muted px-4 py-2">
                    <h4 className="font-medium text-sm">Forward Line {line.lineNumber}</h4>
                    {lines.forwards.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => deleteForwardLine(index)}
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Delete line</span>
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-4">
                    <PlayerPositionSelector
                      position="LW"
                      player={line.leftWing}
                      availablePlayers={availablePlayers}
                      onSelect={(playerId) => handlePositionSelect('forwards', index, 'LW', playerId)}
                    />
                    <PlayerPositionSelector
                      position="C"
                      player={line.center}
                      availablePlayers={availablePlayers}
                      onSelect={(playerId) => handlePositionSelect('forwards', index, 'C', playerId)}
                    />
                    <PlayerPositionSelector
                      position="RW"
                      player={line.rightWing}
                      availablePlayers={availablePlayers}
                      onSelect={(playerId) => handlePositionSelect('forwards', index, 'RW', playerId)}
                    />
                  </div>
                </Card>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addForwardLine}
                className="w-full flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Forward Line
              </Button>
            </TabsContent>
            
            <TabsContent value="defense" className="space-y-4">
              {lines.defense.map((pair, index) => (
                <Card key={`defense-pair-${index}`} className="overflow-hidden">
                  <div className="flex justify-between items-center bg-muted px-4 py-2">
                    <h4 className="font-medium text-sm">Defense Pair {pair.lineNumber}</h4>
                    {lines.defense.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => deleteDefenseLine(index)}
                      >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Delete pair</span>
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-4">
                    <PlayerPositionSelector
                      position="LD"
                      player={pair.leftDefense}
                      availablePlayers={availablePlayers}
                      onSelect={(playerId) => handlePositionSelect('defense', index, 'LD', playerId)}
                    />
                    <PlayerPositionSelector
                      position="RD"
                      player={pair.rightDefense}
                      availablePlayers={availablePlayers}
                      onSelect={(playerId) => handlePositionSelect('defense', index, 'RD', playerId)}
                    />
                  </div>
                </Card>
              ))}
              
              <Button 
                variant="outline" 
                onClick={addDefenseLine}
                className="w-full flex items-center justify-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Add Defense Pair
              </Button>
            </TabsContent>
            
            <TabsContent value="goalies" className="space-y-4">
              <Card>
                <div className="bg-muted px-4 py-2">
                  <h4 className="font-medium text-sm">Goalies</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 p-4">
                  <div>
                    <h5 className="text-xs font-medium mb-1">Starting Goalie</h5>
                    <PlayerPositionSelector
                      position="G"
                      player={lines.goalies[0] || null}
                      availablePlayers={availablePlayers}
                      onSelect={(playerId) => handlePositionSelect('goalies', 0, 'G', playerId)}
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-medium mb-1">Backup Goalie</h5>
                    <PlayerPositionSelector
                      position="G"
                      player={lines.goalies[1] || null}
                      availablePlayers={availablePlayers}
                      onSelect={(playerId) => handlePositionSelect('goalies', 1, 'G', playerId)}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview of the current lineup */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Lineup Preview</h3>
          <NonDraggableLineupView lines={lines} />
        </CardContent>
      </Card>
    </div>
  );
}
