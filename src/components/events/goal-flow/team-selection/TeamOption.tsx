
import { Button } from '@/components/ui/button';
import { Team } from '@/types';

interface TeamOptionProps {
  team: Team;
  onClick: () => void;
}

export function TeamOption({ team, onClick }: TeamOptionProps) {
  return (
    <Button 
      onClick={onClick}
      className="h-20 text-xl"
      variant="outline"
    >
      {team.name}
    </Button>
  );
}
