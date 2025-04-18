
import React, { useState, useEffect } from 'react';
import { Team } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LineupHeader } from './lineup/LineupHeader';
import { NonDraggableLineupView } from './lineup/NonDraggableLineupView';
import { useLineupData } from '@/hooks/lineup/useLineupData';
import { toast } from 'sonner';

interface QuickLineupViewProps {
  team: Team;
}

export function QuickLineupView({ team }: QuickLineupViewProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Use custom hook for lineup data management
  const { lines, loadingState, lastRefreshed, error } = useLineupData(team, refreshKey);
  
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
    setRefreshKey(prevKey => prevKey + 1);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <LineupHeader 
          loadingState={loadingState}
          lastRefreshed={lastRefreshed}
          onRefresh={handleRefresh}
        />
      </CardHeader>
      <CardContent>
        <NonDraggableLineupView lines={lines} />
      </CardContent>
    </Card>
  );
}
