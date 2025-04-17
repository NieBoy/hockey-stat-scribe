
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { StatTrackerHeader } from '@/components/stats/StatTrackerHeader';
import { StatTrackerAssignmentForm } from '@/components/stats/StatTrackerAssignmentForm';
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
        <StatTrackerHeader 
          gameId={gameId!}
          homeTeamName={game?.home_team?.name}
          awayTeamName={game?.away_team?.name}
        />

        <StatTrackerAssignmentForm
          selectedTrackers={selectedTrackers}
          teamMembers={teamMembers}
          loading={loading}
          saveSuccess={saveSuccess}
          onSelect={(statType, value) => setSelectedTrackers(prev => ({
            ...prev,
            [statType]: value || null
          }))}
          onSave={handleTrackerAssignment}
        />
      </div>
    </MainLayout>
  );
}
