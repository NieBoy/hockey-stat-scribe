
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Team, Lines } from "@/types";
import { useLineupEditor } from "@/hooks/useLineupEditor";
import ForwardLineEditor from "./ForwardLineEditor";
import DefenseLineEditor from "./DefenseLineEditor";
import GoaliesEditor from "./GoaliesEditor";
import { SaveStatusIndicator } from "./lineup/SaveStatusIndicator";
import { SaveLineupDialog } from "./lineup/SaveLineupDialog";
import { useSaveLineup } from "@/hooks/lineup/useSaveLineup";

interface TeamLineupEditorProps {
  team: Team;
  onSaveLineup: (lines: Lines) => Promise<void>;
  isSaving?: boolean;
}

export default function TeamLineupEditor({ team, onSaveLineup, isSaving = false }: TeamLineupEditorProps) {
  const {
    lines,
    availablePlayers,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
  } = useLineupEditor(team);

  // Normalize onSaveLineup to match the expected type
  const normalizedSaveLineup = async (linesToSave: Lines): Promise<boolean> => {
    try {
      await onSaveLineup(linesToSave);
      // Since onSaveLineup doesn't return a value, we'll return true to indicate success
      return true;
    } catch (error) {
      console.error("Error in normalized save function:", error);
      return false;
    }
  };

  const {
    saveStatus,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    handleSave
  } = useSaveLineup({
    onSaveLineup: normalizedSaveLineup,
    lines
  });

  // Create a wrapper for handleSave that returns void instead of boolean
  const handleSaveWrapper = async (): Promise<void> => {
    // Call the original handleSave but ignore its return value
    await handleSave();
    // This function returns void
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Lineup</h1>
        <div className="flex items-center gap-2">
          <SaveStatusIndicator status={saveStatus} />
          <Button 
            variant="outline"
            onClick={() => setIsConfirmDialogOpen(true)}
          >
            Save Lineup
          </Button>
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

      <SaveLineupDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleSaveWrapper}
      />
    </>
  );
}
