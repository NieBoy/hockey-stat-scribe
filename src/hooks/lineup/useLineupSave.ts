
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lines } from '@/types';
import { toast } from 'sonner';
import { cloneDeep } from 'lodash';

interface UseLineupSaveProps {
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
  lines: Lines;
}

export function useLineupSave({ onSaveLineup, lines }: UseLineupSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const previousLinesRef = useRef<Lines>(cloneDeep(lines));

  // Detect changes in the lineup
  useEffect(() => {
    const hasChanges = JSON.stringify(previousLinesRef.current) !== JSON.stringify(lines);
    setHasUnsavedChanges(hasChanges);
  }, [lines]);

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
        previousLinesRef.current = cloneDeep(lines);
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
