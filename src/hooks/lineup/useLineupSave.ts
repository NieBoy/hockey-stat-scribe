
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
  const previousLinesRef = useRef<string>(JSON.stringify(lines));
  const initialSaveAttemptedRef = useRef<boolean>(false);

  // Detect changes in the lineup
  useEffect(() => {
    const currentLinesString = JSON.stringify(lines);
    if (previousLinesRef.current !== currentLinesString) {
      setHasUnsavedChanges(true);
      previousLinesRef.current = currentLinesString;
    }
  }, [lines]);

  const handleSave = async () => {
    if (onSaveLineup) {
      try {
        setIsSaving(true);
        initialSaveAttemptedRef.current = true;
        console.log("Saving lineup data:", JSON.stringify(lines, null, 2));
        
        // Create a deep copy of lines to ensure we don't lose data during save
        const linesToSave = cloneDeep(lines);
        const result = await onSaveLineup(linesToSave);
        
        // Treat both undefined and true as success
        const saveSuccessful = result === undefined || result === true;
        
        if (saveSuccessful) {
          toast.success("Lineup saved successfully");
          setHasUnsavedChanges(false);
          return true;
        } else {
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
    }
    return false;
  };

  // Auto-save handler - disabled for now to prevent unexpected player deletions
  useEffect(() => {
    // Only auto-save when explicitly enabled and after first manual save
    if (!isSaving && hasUnsavedChanges && initialSaveAttemptedRef.current && false) { // Disabled with 'false' condition
      const timeoutId = setTimeout(() => {
        console.log("Auto-saving lineup changes");
        handleSave();
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [hasUnsavedChanges, isSaving]);

  return {
    isSaving,
    hasUnsavedChanges,
    saveStatus: isSaving ? 'saving' : hasUnsavedChanges ? 'idle' : 'success',
    lastSavedLineup: previousLinesRef.current,
    isConfirmDialogOpen: false,
    setIsConfirmDialogOpen: useState<boolean>(false)[1],
    handleSave
  };
}
