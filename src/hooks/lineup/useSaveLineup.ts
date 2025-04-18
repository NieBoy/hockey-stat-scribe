
import { useState } from "react";
import { Lines } from "@/types";
import { toast } from "sonner";

export function useSaveLineup(onSaveLineup: (lines: Lines) => Promise<void>) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [lastSavedLineup, setLastSavedLineup] = useState<string>('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const handleSaveLineup = async (lines: Lines) => {
    try {
      setSaveStatus('saving');
      await onSaveLineup(lines);
      setLastSavedLineup(JSON.stringify(lines));
      setSaveStatus('success');
      toast.success("Lineup saved successfully");
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      setSaveStatus('error');
      toast.error("Failed to save lineup");
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  };

  return {
    saveStatus,
    lastSavedLineup,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    handleSaveLineup
  };
}
