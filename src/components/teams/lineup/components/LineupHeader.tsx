
import React from 'react';
import { CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Save } from 'lucide-react';
import { Lines } from '@/types';

interface LineupHeaderProps {
  onSave: () => Promise<boolean>;
  onRefresh: () => Promise<Lines | null>;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export function LineupHeader({ onSave, onRefresh, isSaving, hasUnsavedChanges }: LineupHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Team Lineup</CardTitle>
      <div className="flex items-center gap-2">
        {isSaving && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Saving...
          </Badge>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh} 
          disabled={isSaving}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        <Button 
          onClick={onSave} 
          disabled={isSaving || !hasUnsavedChanges}
          size="sm"
          className="flex items-center gap-1"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Lineup'}
        </Button>
      </div>
    </CardHeader>
  );
}
