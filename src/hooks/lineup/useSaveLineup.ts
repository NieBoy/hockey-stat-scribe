
import { useState } from "react";
import { Lines } from "@/types";
import { toast } from "sonner";

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

  const handleSave = async () => {
    if (!onSaveLineup) {
      toast.error("No save function provided");
      return false;
    }

    try {
      setSaveStatus('saving');
      const result = await onSaveLineup(lines);
      
      const saveSuccessful = result === undefined || result === true;
      
      if (saveSuccessful) {
        setLastSavedLineup(JSON.stringify(lines));
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
    hasUnsavedChanges: saveStatus !== 'success',
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    handleSave
  };
}
