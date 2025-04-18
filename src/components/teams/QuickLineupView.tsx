
import { useState, useEffect } from 'react';
import { Team, Lines } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EvenStrengthLines } from './lineup/EvenStrengthLines';
import { buildInitialLines } from '@/utils/lineupUtils';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { getTeamLineup } from '@/services/teams/lineupManagement';

interface QuickLineupViewProps {
  team: Team;
}

export function QuickLineupView({ team }: QuickLineupViewProps) {
  const [lines, setLines] = useState<Lines>(() => buildInitialLines(team));
  const [loadingState, setLoadingState] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const fetchLineup = async () => {
      try {
        setLoadingState('loading');
        console.log("QuickLineupView - Fetching lineup for team:", team.id);
        
        const lineupData = await getTeamLineup(team.id);
        console.log("QuickLineupView - Retrieved lineup data:", lineupData);
        
        // Apply positions from database to the team players
        const updatedTeam = {
          ...team,
          players: team.players.map(player => {
            const lineupPlayer = lineupData.find(lp => lp.user_id === player.id);
            if (lineupPlayer && lineupPlayer.position) {
              return {
                ...player,
                position: lineupPlayer.position,
                lineNumber: lineupPlayer.line_number
              };
            }
            return player;
          })
        };
        
        const refreshedLines = buildInitialLines(updatedTeam);
        console.log("QuickLineupView - Built lines structure:", refreshedLines);
        setLines(refreshedLines);
        setLoadingState('success');
      } catch (error) {
        console.error("QuickLineupView - Error fetching lineup:", error);
        setLoadingState('error');
      }
    };

    fetchLineup();
  }, [team]);

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Current Lineup</CardTitle>
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <EvenStrengthLines 
            lines={lines}
            onAddForwardLine={() => {}}
            onAddDefenseLine={() => {}}
          />
        </div>
      </CardContent>
    </Card>
  );
}
