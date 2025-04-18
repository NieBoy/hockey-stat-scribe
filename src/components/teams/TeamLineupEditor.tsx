import { useState, useEffect } from "react";
import { Team, Lines } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import ForwardLineEditor from "./ForwardLineEditor";
import DefenseLineEditor from "./DefenseLineEditor";
import GoaliesEditor from "./GoaliesEditor";
import RosterDragDrop from "./RosterDragDrop";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface TeamLineupEditorProps {
  team: Team;
  onSaveLineup: (lines: Lines) => Promise<void>;
  isSaving?: boolean;
}

export default function TeamLineupEditor({ team, onSaveLineup, isSaving = false }: TeamLineupEditorProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'standard' | 'drag-drop'>('standard');
  
  const {
    lines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine
  } = useLineupEditor(team);

  // Auto-save whenever lines change
  useEffect(() => {
    const saveLines = async () => {
      await onSaveLineup(lines);
    };
    saveLines();
  }, [lines, onSaveLineup]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Lineup</h1>
        <div className="flex gap-2">
          <Button 
            variant={editorMode === 'standard' ? 'default' : 'outline'} 
            onClick={() => setEditorMode('standard')}
          >
            Standard Editor
          </Button>
          <Button 
            variant={editorMode === 'drag-drop' ? 'default' : 'outline'} 
            onClick={() => setEditorMode('drag-drop')}
          >
            Drag & Drop Editor
          </Button>
        </div>
      </div>

      {editorMode === 'drag-drop' ? (
        <RosterDragDrop 
          team={team} 
          onSave={onSaveLineup} 
          isSaving={isSaving}
        />
      ) : (
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
              onClick={handleSaveRequest} 
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
      )}

      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save Team Lineup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will save your current lineup configuration. Any unassigned players will remain on the team but won't appear in the lineup.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveLineup}>Save Lineup</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamLineupEditor;
