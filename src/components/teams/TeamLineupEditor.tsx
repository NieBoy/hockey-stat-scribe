
import { useState, useEffect } from "react";
import { Team, Lines } from "@/types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Loader2 } from "lucide-react";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import ForwardLineEditor from "./ForwardLineEditor";
import DefenseLineEditor from "./DefenseLineEditor";
import GoaliesEditor from "./GoaliesEditor";
import { Badge } from "@/components/ui/badge";
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const {
    lines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine
  } = useLineupEditor(team);

  // Auto-save with debounce timer whenever lines change
  useEffect(() => {
    // Track if component is mounted to prevent calling setState after unmount
    let isMounted = true;
    
    const saveLines = async () => {
      try {
        if (!isMounted) return;
        
        setSaveStatus('saving');
        console.log("Auto-saving lineup from TeamLineupEditor", lines);
        await onSaveLineup(lines);
        
        if (isMounted) {
          setSaveStatus('success');
          // Reset status after a delay
          setTimeout(() => {
            if (isMounted) setSaveStatus('idle');
          }, 2000);
        }
      } catch (error) {
        console.error("Error auto-saving lineup:", error);
        if (isMounted) {
          setSaveStatus('error');
          // Reset error status after a longer delay
          setTimeout(() => {
            if (isMounted) setSaveStatus('idle');
          }, 3000);
        }
      }
    };
    
    // Add a small delay to prevent too frequent saves
    const timeoutId = setTimeout(() => {
      saveLines();
    }, 1000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [lines, onSaveLineup]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Lineup</h1>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> Saving...
            </Badge>
          )}
          {saveStatus === 'success' && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Saved
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="destructive">
              Save Error
            </Badge>
          )}
        </div>
      </div>

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
      </Tabs>

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
            <AlertDialogAction onClick={() => onSaveLineup(lines)}>Save Lineup</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
