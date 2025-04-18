
import { useState } from 'react';
import { TeamType } from '@/types/game-control';

export function useTeamControl() {
  const [teamType, setTeamType] = useState<TeamType>('home');

  return {
    teamType,
    setTeamType
  };
}
