
import React, { useState, useEffect } from 'react';
import { Team } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LineupHeader } from './lineup/LineupHeader';
import { NonDraggableLineupView } from './lineup/NonDraggableLineupView';
import { useLineupData } from '@/hooks/lineup/useLineupData';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

interface QuickLineupViewProps {
  team: Team;
}

export function QuickLineupView({ team }: QuickLineupViewProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use custom hook for lineup data management
  const { lines, loadingState, lastRefreshed, error, hasPositionData } = useLineupData(team, refreshKey);
  
  // Set up auto-refresh every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("QuickLineupView - Auto-refreshing lineup data");
      setRefreshKey(prevKey => prevKey + 1);
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []); 

  // Show error toast if data loading fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to load lineup data");
    }
  }, [error]);

  const handleRefresh = () => {
    console.log("QuickLineupView - Manual refresh triggered");
    setRefreshKey(prevKey => prevKey + 1);
    toast.success("Refreshing lineup data...");
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <LineupHeader 
            loadingState={loadingState}
            lastRefreshed={lastRefreshed}
            onRefresh={handleRefresh}
          />
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            className="ml-auto"
          >
            Refresh
          </Button>
        </div>
        {!hasPositionData && loadingState === 'success' && (
          <div className="mt-2 text-sm text-amber-500 bg-amber-50 p-2 rounded-md border border-amber-200">
            No lineup data found. Please use the "Edit Lineup" button to set up your team lineup.
          </div>
        )}
      </CardHeader>
      <CardContent>
        <NonDraggableLineupView lines={lines} />
      </CardContent>
    </Card>
  );
}
