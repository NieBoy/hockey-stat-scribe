
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
    if (!onSaveLineup || isSaving) return false;
    
    try {
      setIsSaving(true);
      console.log("Starting lineup save...");
      
      const linesToSave = cloneDeep(lines);
      console.log("Saving lineup:", JSON.stringify(linesToSave, null, 2));
      
      const result = await onSaveLineup(linesToSave);
      
      const saveSuccessful = result === undefined || result === true;
      
      if (saveSuccessful) {
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
    handleSave
  };
}
