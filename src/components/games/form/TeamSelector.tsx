
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Team } from '@/types';

interface TeamSelectorProps {
  teams: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TeamSelector({ teams, value, onChange, error }: TeamSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="homeTeam">Home Team</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select home team" />
        </SelectTrigger>
        <SelectContent>
          {teams.map((team) => (
            <SelectItem key={team.id} value={team.id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
