
import { Button } from '@/components/ui/button';
import { Team } from '@/types';

interface TeamOptionProps {
  team: Team | null;
  onClick: () => void;
}

export function TeamOption({ team, onClick }: TeamOptionProps) {
  // Add defensive check to handle null team
  const teamName = team?.name || 'Team';
  
  return (
    <Button 
      onClick={onClick}
      className="h-20 text-xl"
      variant="outline"
    >
      {teamName}
    </Button>
  );
}
