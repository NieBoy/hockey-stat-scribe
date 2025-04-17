
import { useState } from "react";
import { Team, Lines } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import ForwardLineEditor from "./ForwardLineEditor";
import DefenseLineEditor from "./DefenseLineEditor";
import GoaliesEditor from "./GoaliesEditor";

export interface TeamLineupEditorProps {
  team: Team;
  onSaveLineup: (lines: Lines) => Promise<void>;
  isSaving?: boolean;
}

const TeamLineupEditor = ({ team, onSaveLineup, isSaving = false }: TeamLineupEditorProps) => {
  const {
    lines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine
  } = useLineupEditor(team);

  const handleSaveLineup = async () => {
    await onSaveLineup(lines);
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
            <ForwardLineEditor 
              key={index}
              line={line}
              index={index}
              availablePlayers={availablePlayers}
              onPlayerSelect={handlePlayerSelect}
            />
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
            <DefenseLineEditor 
              key={index}
              line={line}
              index={index}
              availablePlayers={availablePlayers}
              onPlayerSelect={handlePlayerSelect}
            />
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
        <GoaliesEditor 
          goalies={lines.goalies}
          availablePlayers={availablePlayers}
          onPlayerSelect={handlePlayerSelect}
        />
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

export default TeamLineupEditor;
