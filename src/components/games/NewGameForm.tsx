
import { useState } from 'react';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OpponentSelect } from './OpponentSelect';

// Define a schema for form validation
const gameFormSchema = z.object({
  date: z.date({
    required_error: "Please select a date",
  }),
  homeTeam: z.string({
    required_error: "Please select a home team",
  }),
  opponentName: z.string({
    required_error: "Please enter an opponent name",
  }).min(3, {
    message: "Opponent name must be at least 3 characters",
  }),
  location: z.string({
    required_error: "Please enter a location",
  }).min(3, {
    message: "Location must be at least 3 characters",
  }),
  periods: z.number({
    required_error: "Please select the number of periods",
  }).int().min(1).max(5),
});

export type GameFormState = z.infer<typeof gameFormSchema>;

interface NewGameFormProps {
  teams: { id: string; name: string }[];
  onSubmit: (data: GameFormState) => void;
  isLoading?: boolean;
}

export default function NewGameForm({ teams, onSubmit, isLoading = false }: NewGameFormProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [homeTeam, setHomeTeam] = useState('');
  const [opponentName, setOpponentName] = useState('');
  const [location, setLocation] = useState('');
  const [periods, setPeriods] = useState(3);

  const [errors, setErrors] = useState<Partial<Record<keyof GameFormState, string>>>({});

  const validateForm = (): boolean => {
    const result = gameFormSchema.safeParse({
      date,
      homeTeam,
      opponentName,
      location,
      periods,
    });

    if (!result.success) {
      const newErrors: Partial<Record<keyof GameFormState, string>> = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof GameFormState;
        newErrors[key] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const formData: GameFormState = {
        date: date!,
        homeTeam,
        opponentName,
        location,
        periods,
      };
      onSubmit(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date">Game Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-red-500">{errors.date}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="homeTeam">Home Team</Label>
        <Select value={homeTeam} onValueChange={setHomeTeam}>
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
        {errors.homeTeam && (
          <p className="text-sm text-red-500">{errors.homeTeam}</p>
        )}
      </div>

      <OpponentSelect 
        value={opponentName} 
        onChange={setOpponentName} 
      />
      {errors.opponentName && (
        <p className="text-sm text-red-500">{errors.opponentName}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Enter game location"
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="periods">Number of Periods</Label>
        <Select
          value={periods.toString()}
          onValueChange={(value) => setPeriods(parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select number of periods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2</SelectItem>
            <SelectItem value="3">3</SelectItem>
            <SelectItem value="4">4</SelectItem>
          </SelectContent>
        </Select>
        {errors.periods && (
          <p className="text-sm text-red-500">{errors.periods}</p>
        )}
      </div>

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
