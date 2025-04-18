
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Save } from 'lucide-react';

interface LineupHeaderProps {
  onSave: () => Promise<boolean>;
  onRefresh: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export function LineupHeader({ 
  onSave, 
  onRefresh, 
  isSaving, 
  hasUnsavedChanges 
}: LineupHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Team Lineup</CardTitle>
      <div className="flex items-center gap-2">
        {hasUnsavedChanges && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Unsaved Changes
          </Badge>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Button 
          variant="default" 
          size="sm" 
          onClick={onSave} 
          disabled={isSaving || !hasUnsavedChanges}
          className="flex items-center gap-1"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Lineup
            </>
          )}
        </Button>
      </div>
    </CardHeader>
  );
}
