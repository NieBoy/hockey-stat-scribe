
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Team, Lines } from '@/types';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import RosterLineupEditor from '../RosterDragDrop';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { LineupHeader } from './components/LineupHeader';
import { useSaveLineup } from '@/hooks/lineup/useSaveLineup';

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
        onSave={handleSave}
        onRefresh={onRefresh}
        isSaving={isSaving} 
        hasUnsavedChanges={hasUnsavedChanges}
      />
      <CardContent>
        <RosterLineupEditor 
          team={team} 
          onSave={handleSave}
          isSaving={isSaving}
        />
      </CardContent>
    </Card>
  );
}
