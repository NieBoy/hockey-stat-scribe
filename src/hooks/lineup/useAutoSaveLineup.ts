
import { useState, useEffect, useRef } from 'react';
import { Lines } from '@/types';
import { toast } from 'sonner';
import { cloneDeep, isEqual } from 'lodash';

interface UseAutoSaveLineupProps {
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
  lines: Lines;
  autoSaveDelay?: number; // Delay in ms before auto-saving
}

// This hook is now completely disabled to prevent any auto-saving functionality
export function useAutoSaveLineup({ 
  onSaveLineup, 
  lines, 
  autoSaveDelay = 1000 
}: UseAutoSaveLineupProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // This hook no longer performs any auto-saving
  console.log("Auto-save functionality has been disabled");
  
  // Detect changes but don't auto-save
  useEffect(() => {
    const hasChanges = true; // Just for UI indication
    setHasUnsavedChanges(hasChanges);
  }, [lines]);

  // Manual save function (no longer auto-triggered)
  const forceSave = async () => {
    if (!onSaveLineup || saveStatus === 'saving') {
      return false;
    }
    
    try {
      setSaveStatus('saving');
      const linesToSave = cloneDeep(lines);
      const result = await onSaveLineup(linesToSave);
      const saveSuccessful = result === undefined || result === true;
      
      if (saveSuccessful) {
        setLastSavedAt(new Date());
        setSaveStatus('success');
        toast.success("Lineup saved");
        setHasUnsavedChanges(false);
        return true;
      }
      
      return false;
    } catch (error) {
      setSaveStatus('error');
      return false;
    } finally {
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  return {
    saveStatus,
    isSaving: saveStatus === 'saving',
    lastSavedAt,
    forceSave, // Only triggered manually
    hasUnsavedChanges
  };
}
