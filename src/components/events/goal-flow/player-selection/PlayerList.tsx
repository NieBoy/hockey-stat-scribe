
import { Team, User } from '@/types';
import { SimplePlayerLinesView } from '../../player-lines/SimplePlayerLinesView';

interface PlayerListProps {
  team: Team;
  onPlayerSelect: (player: User) => void;
  selectedPlayers: User[];
}

export function PlayerList({ team, onPlayerSelect, selectedPlayers }: PlayerListProps) {
  return (
    <SimplePlayerLinesView 
      team={team}
      onPlayerSelect={onPlayerSelect}
      selectedPlayers={selectedPlayers}
    />
  );
}
