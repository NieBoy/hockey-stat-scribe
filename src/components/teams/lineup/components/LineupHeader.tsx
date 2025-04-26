
import React from 'react';
import { CardTitle, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';

interface LineupHeaderProps {
  onSave: () => Promise<boolean>;
  onRefresh: () => Promise<any>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export function LineupHeader({ 
  onSave, 
  onRefresh, 
  isSaving, 
  hasUnsavedChanges 
}: LineupHeaderProps) {
  const handleSaveClick = async () => {
    console.log("Save button clicked in LineupHeader");
    await onSave();
  };

  const handleRefreshClick = async () => {
    console.log("Refresh button clicked in LineupHeader");
    await onRefresh();
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Team Lineup</CardTitle>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefreshClick} 
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Button 
          onClick={handleSaveClick} 
          disabled={isSaving || !hasUnsavedChanges}
          size="sm"
          variant="default"
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </CardHeader>
  );
}
