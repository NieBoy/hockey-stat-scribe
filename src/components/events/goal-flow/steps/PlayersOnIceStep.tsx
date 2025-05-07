
import React, { useEffect } from 'react';
import { Team, User } from '@/types';
import { PlayerSelectionWrapper } from './players-on-ice/PlayerSelectionWrapper';

interface PlayersOnIceStepProps {
  team: Team;
  onPlayersSelect: (players: User[]) => void;
  preSelectedPlayers: User[];
  onComplete: () => void;
  isOpponentTeam?: boolean;
}

export function PlayersOnIceStep({
  team,
  onPlayersSelect,
  preSelectedPlayers,
  onComplete,
  isOpponentTeam = false
}: PlayersOnIceStepProps) {
  
  // Debug logging to help track issues with player availability
  useEffect(() => {
    if (isOpponentTeam) {
      console.log("PlayersOnIceStep - Home team for plus/minus:", {
        teamName: team?.name,
        playersCount: team?.players?.length || 0,
      });
    }
  }, [team, isOpponentTeam]);

  return (
    <div>
      <PlayerSelectionWrapper
        team={team}
        onPlayersSelect={onPlayersSelect}
        preSelectedPlayers={preSelectedPlayers}
        onComplete={onComplete}
        isOpponentTeam={isOpponentTeam}
      />
    </div>
  );
}
