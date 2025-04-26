
import { useState } from 'react';
import { Lines } from '@/types';
import { toast } from 'sonner';
import { cloneDeep } from 'lodash';

interface UseLineupSaveProps {
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
  lines: Lines;
}

export function useSaveLineup({ onSaveLineup, lines }: UseLineupSaveProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(true);

  const handleSave = async () => {
    if (!onSaveLineup) {
      console.error("No save function provided to useSaveLineup");
      return false;
    }
    
    if (isSaving) {
      console.log("Already saving, ignoring duplicate save request");
      return false;
    }
    
    try {
      setIsSaving(true);
      console.log("useSaveLineup - Starting lineup save...");
      
      const linesToSave = cloneDeep(lines);
      console.log("useSaveLineup - Saving lineup:", JSON.stringify(linesToSave, null, 2));
      
      const result = await onSaveLineup(linesToSave);
      console.log("useSaveLineup - Save result:", result);
      
      const saveSuccessful = result === undefined || result === true;
      
      if (saveSuccessful) {
        console.log("useSaveLineup - Save successful");
        setHasUnsavedChanges(false);
        toast.success("Lineup saved successfully");
        return true;
      } else {
        console.error("useSaveLineup - Save returned false");
        toast.error("Failed to save lineup");
        return false;
      }
    } catch (error) {
      console.error("useSaveLineup - Error saving lineup:", error);
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
    setHasUnsavedChanges,
    handleSave
  };
}
