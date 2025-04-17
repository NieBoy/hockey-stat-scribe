
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { StatTypeSelector } from '@/components/stats/StatTypeSelector';
import { useStatTrackerAssignment } from '@/hooks/useStatTrackerAssignment';

export default function StatTrackerAssignment() {
  const { id: gameId } = useParams<{ id: string }>();
  const {
    game,
    teamMembers,
    selectedTrackers,
    setSelectedTrackers,
    loading,
    saveSuccess,
    handleTrackerAssignment
  } = useStatTrackerAssignment(gameId);

  if (loading && !game) return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">Loading game data...</p>
        </div>
      </div>
    </MainLayout>
  );

  return (
    <MainLayout>
      <div className="container mx-auto p-4 space-y-6">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to={`/games/${gameId}`} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back to Game
          </Link>
        </Button>

        <div className="space-y-6">
          <h1 className="text-2xl font-bold">
            {game ? `Assign Stat Trackers for ${game.home_team?.name || 'Home Team'} vs ${game.away_team?.name || 'Away Team'}` : 'Assign Stat Trackers'}
          </h1>

          <Card className="p-6">
            <StatTypeSelector
              selectedTrackers={selectedTrackers}
              teamMembers={teamMembers}
              onSelect={(statType, value) => setSelectedTrackers(prev => ({
                ...prev,
                [statType]: value || null
              }))}
            />

            <Button 
              onClick={handleTrackerAssignment}
              className="mt-6 w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : saveSuccess ? 'Saved Successfully' : 'Save Assignments'}
            </Button>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
