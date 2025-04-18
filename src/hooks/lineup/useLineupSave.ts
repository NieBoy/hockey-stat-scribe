
import { useState, useEffect, useRef, useCallback } from 'react';
import { Lines } from '@/types';
import { toast } from 'sonner';

interface UseLineupSaveProps {
  onSaveLineup?: (lines: Lines) => Promise<boolean>;
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
        
        const success = await onSaveLineup(lines);
        
        if (success) {
          toast.success("Lineup saved successfully");
          setHasUnsavedChanges(false);
        } else {
          toast.error("Failed to save lineup");
        }
        
        return success;
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

  // Auto-save handler
  useEffect(() => {
    if (!isSaving && hasUnsavedChanges && initialSaveAttemptedRef.current) {
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
    handleSave
  };
}
