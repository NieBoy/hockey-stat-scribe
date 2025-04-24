
import { Button } from '@/components/ui/button';
import { GameFormState } from '@/types';
import { useNewGameForm } from '@/hooks/games/useNewGameForm';
import { DateSelector } from './form/DateSelector';
import { TeamSelector } from './form/TeamSelector';
import { OpponentSelect } from './OpponentSelect';
import { LocationInput } from './form/LocationInput';
import { PeriodsSelector } from './form/PeriodsSelector';

interface NewGameFormProps {
  teams: { id: string; name: string }[];
  onSubmit: (data: GameFormState) => void;
  isLoading?: boolean;
}

export default function NewGameForm({ teams, onSubmit, isLoading = false }: NewGameFormProps) {
  const {
    date,
    setDate,
    homeTeam,
    setHomeTeam,
    opponentName,
    setOpponentName,
    location,
    setLocation,
    periods,
    setPeriods,
    errors,
    handleSubmit,
  } = useNewGameForm(onSubmit);

  return (
    <div className="space-y-6">
      <DateSelector 
        date={date}
        onSelect={setDate}
        error={errors.date}
      />

      <TeamSelector
        teams={teams}
        value={homeTeam}
        onChange={setHomeTeam}
        error={errors.homeTeam}
      />

      <OpponentSelect 
        value={opponentName}
        onChange={setOpponentName}
      />
      {errors.opponentName && (
        <p className="text-sm text-red-500">{errors.opponentName}</p>
      )}

      <LocationInput
        value={location}
        onChange={setLocation}
        error={errors.location}
      />

      <PeriodsSelector
        value={periods}
        onChange={setPeriods}
        error={errors.periods}
      />

      <Button 
        type="submit" 
        onClick={handleSubmit}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Creating..." : "Create Game"}
      </Button>
    </div>
  );
}
