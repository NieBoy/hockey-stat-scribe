
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

interface LineupHeaderProps {
  loadingState: 'loading' | 'success' | 'error';
  lastRefreshed: Date;
  onRefresh: () => void;
}

export function LineupHeader({ loadingState, lastRefreshed, onRefresh }: LineupHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <CardTitle>Current Lineup</CardTitle>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh} 
          disabled={loadingState === 'loading'}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
        
        {loadingState === 'loading' && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading...
          </Badge>
        )}
        {loadingState === 'error' && (
          <Badge variant="destructive">
            Error Loading Lineup
          </Badge>
        )}
        {loadingState === 'success' && lastRefreshed && (
          <Badge variant="outline" className="text-xs">
            Updated {lastRefreshed.toLocaleTimeString()}
          </Badge>
        )}
      </div>
    </div>
  );
}
