
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { SaveIcon, RefreshCw } from "lucide-react";
import { Loader2 } from "lucide-react";

interface LineupHeaderProps {
  onSave: () => Promise<void>;
  onRefresh: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export function LineupHeader({
  onSave,
  onRefresh,
  isSaving,
  hasUnsavedChanges
}: LineupHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Team Lineup Editor</CardTitle>
      <div className="flex space-x-2">
        <Button 
          onClick={onRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          variant={hasUnsavedChanges ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <SaveIcon className="h-4 w-4" />}
          {hasUnsavedChanges ? "Save Changes" : "Save Lineup"}
        </Button>
      </div>
    </CardHeader>
  );
}
