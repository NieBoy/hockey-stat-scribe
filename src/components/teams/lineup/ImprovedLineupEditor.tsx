
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Team, Lines, Position, User } from '@/types';
import { useLineupEditor } from '@/hooks/useLineupEditor';
import RosterDragDrop from '../RosterDragDrop';
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

  const onSave = async () => {
    return await handleSave();
  };

  const onRefresh = async () => {
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
        onSave={onSave}
        onRefresh={onRefresh}
        isSaving={isSaving} 
        hasUnsavedChanges={hasUnsavedChanges}
      />
      <CardContent>
        <RosterDragDrop 
          team={team} 
          onSave={async (lines) => {
            if (onSaveLineup) {
              await onSaveLineup(lines);
              return;
            }
          }}
          isSaving={isSaving}
        />
      </CardContent>
    </Card>
  );
}
