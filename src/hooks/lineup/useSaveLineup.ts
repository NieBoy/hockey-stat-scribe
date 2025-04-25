
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lines } from '@/types';
import { toast } from 'sonner';
import { cloneDeep } from 'lodash';

interface UseLineupSaveProps {
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
  lines: Lines;
}

export function useSaveLineup({ onSaveLineup, lines }: UseLineupSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const previousLinesRef = useRef<Lines>(cloneDeep(lines));
  const initialSaveCompleted = useRef<boolean>(false);

  // Detect changes in the lineup - only for UI indication
  useEffect(() => {
    if (initialSaveCompleted.current) {
      // Only check for changes after initial save or if we have previously saved
      const currentJson = JSON.stringify(lines);
      const previousJson = JSON.stringify(previousLinesRef.current);
      const hasChanges = currentJson !== previousJson;
      console.log("Lineup change detected:", hasChanges);
      setHasUnsavedChanges(hasChanges);
    } else if (!hasUnsavedChanges) {
      // On first load, mark as having unsaved changes to allow initial save
      setHasUnsavedChanges(true);
    }
  }, [lines, hasUnsavedChanges]);

  const handleSave = async () => {
    if (!onSaveLineup || isSaving) return false;
    
    try {
      setIsSaving(true);
      console.log("Starting lineup save...");
      
      // Create a deep copy of lines to ensure we don't lose data during save
      const linesToSave = cloneDeep(lines);
      const result = await onSaveLineup(linesToSave);
      
      // Treat both undefined and true as success
      const saveSuccessful = result === undefined || result === true;
      
      if (saveSuccessful) {
        console.log("Save successful, updating state");
        // Important: Update the reference with a fresh deep clone
        previousLinesRef.current = cloneDeep(lines);
        initialSaveCompleted.current = true;
        setHasUnsavedChanges(false);
        toast.success("Lineup saved successfully");
        return true;
      } else {
        console.error("Save returned false");
        toast.error("Failed to save lineup");
        return false;
      }
    } catch (error) {
      console.error("Error saving lineup:", error);
      toast.error("Error saving lineup", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    hasUnsavedChanges,
    saveStatus: isSaving ? 'saving' : hasUnsavedChanges ? 'idle' : 'success',
    lastSavedLines: previousLinesRef.current,
    handleSave
  };
}
