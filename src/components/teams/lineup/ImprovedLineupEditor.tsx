
import React, { useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Team, Lines } from '@/types';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import RosterLineupEditor from '../RosterDragDrop';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { LineupHeader } from './components/LineupHeader';
import { useSaveLineup } from '@/hooks/lineup/useSaveLineup';
import { toast } from 'sonner';

interface ImprovedLineupEditorProps {
  team: Team;
  onSaveLineup?: (lines: Lines) => Promise<boolean | void>;
}

export function ImprovedLineupEditor({ team, onSaveLineup }: ImprovedLineupEditorProps) {
  const {
    lines,
    availablePlayers,
    handlePlayerMove,
    handlePlayerSelect,
    addForwardLine,
    addDefenseLine,
    isLoading,
    refreshLineupData,
  } = useLineupEditor(team);

  const {
    isSaving,
    hasUnsavedChanges,
    handleSave
  } = useSaveLineup({ onSaveLineup, lines });

  // Create a wrapper for the save function with extra logging
  const handleSaveWrapper = useCallback(async () => {
    console.log("ImprovedLineupEditor - Save initiated");
    if (!onSaveLineup) {
      console.warn("No onSaveLineup function provided");
      toast.error("Cannot save lineup: Save function not available");
      return false;
    }
    try {
      const result = await handleSave();
      console.log("ImprovedLineupEditor - Save completed with result:", result);
      return result;
    } catch (error) {
      console.error("ImprovedLineupEditor - Save error:", error);
      return false;
    }
  }, [handleSave, onSaveLineup]);

  const onRefresh = async () => {
    console.log("Manual refresh initiated from button click");
    return await refreshLineupData();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center min-h-[300px]">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <LineupHeader 
        onSave={handleSaveWrapper}
        onRefresh={onRefresh}
        isSaving={isSaving} 
        hasUnsavedChanges={hasUnsavedChanges}
      />
      <CardContent>
        <RosterLineupEditor 
          team={team} 
          onSave={handleSaveWrapper}
          isSaving={isSaving}
        />
      </CardContent>
    </Card>
  );
}
