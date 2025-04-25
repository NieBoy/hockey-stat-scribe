
import { useState, useRef, useEffect } from "react";
import { Lines } from "@/types";
import { toast } from "sonner";
import { cloneDeep } from "lodash";

export function useSaveLineup({
  onSaveLineup,
  lines
}: {
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
  lines: Lines;
}) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSavedLineup, setLastSavedLineup] = useState<string>('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const previousLinesRef = useRef<Lines>(cloneDeep(lines));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(true);

  useEffect(() => {
    const currentJson = JSON.stringify(lines);
    const previousJson = JSON.stringify(previousLinesRef.current);
    const hasChanges = currentJson !== previousJson && lastSavedLineup !== currentJson;
    setHasUnsavedChanges(hasChanges);
  }, [lines, lastSavedLineup]);

  const handleSave = async () => {
    if (!onSaveLineup) {
      toast.error("No save function provided");
      return false;
    }

    if (!hasUnsavedChanges) {
      toast.info("No changes to save");
      return true;
    }

    try {
      setSaveStatus('saving');
      
      // Create a deep copy to avoid mutation during save
      const linesToSave = cloneDeep(lines);
      const result = await onSaveLineup(linesToSave);
      
      const saveSuccessful = result === undefined || result === true;
      
      if (saveSuccessful) {
        const currentLineupJson = JSON.stringify(lines);
        setLastSavedLineup(currentLineupJson);
        previousLinesRef.current = cloneDeep(lines);
        setHasUnsavedChanges(false);
        setSaveStatus('success');
        toast.success("Lineup saved successfully");
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
        return true;
      } else {
        throw new Error("Save was not successful");
      }
    } catch (error) {
      setSaveStatus('error');
      toast.error("Failed to save lineup");
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      return false;
    }
  };

  return {
    saveStatus,
    lastSavedLineup,
    isSaving: saveStatus === 'saving',
    hasUnsavedChanges,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    handleSave
  };
}
