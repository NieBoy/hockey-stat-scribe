
import { useState, useEffect, useRef } from 'react';
import { Lines } from '@/types';
import { toast } from 'sonner';
import { cloneDeep, isEqual } from 'lodash';

interface UseAutoSaveLineupProps {
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
  lines: Lines;
  autoSaveDelay?: number; // Delay in ms before auto-saving
}

export function useAutoSaveLineup({ 
  onSaveLineup, 
  lines, 
  autoSaveDelay = 1000 
}: UseAutoSaveLineupProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const previousLinesRef = useRef<Lines>(cloneDeep(lines));
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const saveAttemptRef = useRef<number>(0);
  
  // Detect changes and trigger auto-save
  useEffect(() => {
    // Don't auto-save on first render
    if (!lastSavedAt && isEqual(lines, previousLinesRef.current)) {
      return;
    }

    const hasChanges = !isEqual(lines, previousLinesRef.current);
    
    if (!hasChanges) {
      return;
    }
    
    // Verify that we have data to save before triggering
    const hasData = (
      lines.forwards.some(line => line.leftWing || line.center || line.rightWing) ||
      lines.defense.some(line => line.leftDefense || line.rightDefense) ||
      lines.goalies.length > 0
    );
    
    if (!hasData) {
      console.log("Not scheduling auto-save - no meaningful data to save");
      return;
    }
    
    console.log("Lineup changes detected, scheduling auto-save");
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout for auto-saving
    saveTimeoutRef.current = setTimeout(() => {
      handleSave();
    }, autoSaveDelay);
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [lines]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!onSaveLineup || saveStatus === 'saving') {
      return false;
    }
    
    try {
      setSaveStatus('saving');
      console.log("Starting lineup auto-save...");
      
      // Create a deep copy to avoid mutation during save
      const linesToSave = cloneDeep(lines);
      
      // Verify we have players to save
      const hasPlayersToSave = (
        linesToSave.forwards.some(line => line.leftWing || line.center || line.rightWing) ||
        linesToSave.defense.some(line => line.leftDefense || line.rightDefense) ||
        linesToSave.goalies.length > 0
      );
      
      if (!hasPlayersToSave) {
        throw new Error("No player data to save");
      }
      
      // Increment save attempt counter
      saveAttemptRef.current++;
      const currentAttempt = saveAttemptRef.current;
      
      // Perform the save
      const result = await onSaveLineup(linesToSave);
      
      // Ensure this is still the most recent save attempt
      if (currentAttempt !== saveAttemptRef.current) {
        console.log("Ignoring outdated save response");
        return false;
      }
      
      // Treat both undefined and true as success
      const saveSuccessful = result === undefined || result === true;
      
      if (saveSuccessful) {
        console.log("Auto-save successful");
        previousLinesRef.current = cloneDeep(lines);
        setLastSavedAt(new Date());
        setSaveStatus('success');
        toast.success("Lineup saved");
        
        // Reset status after a delay
        setTimeout(() => {
          if (saveStatus === 'success') {
            setSaveStatus('idle');
          }
        }, 2000);
        
        return true;
      } else {
        throw new Error("Save was not successful");
      }
    } catch (error) {
      console.error("Error auto-saving lineup:", error);
      setSaveStatus('error');
      toast.error("Failed to save lineup", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
      
      // Reset status after a delay
      setTimeout(() => {
        if (saveStatus === 'error') {
          setSaveStatus('idle');
        }
      }, 3000);
      
      return false;
    }
  };

  // Force a save immediately if needed
  const forceSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    return handleSave();
  };

  return {
    saveStatus,
    isSaving: saveStatus === 'saving',
    lastSavedAt,
    forceSave, // Exposed for manual saving if needed
    hasUnsavedChanges: !isEqual(lines, previousLinesRef.current)
  };
}
