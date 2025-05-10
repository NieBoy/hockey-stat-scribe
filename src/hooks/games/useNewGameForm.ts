
import { useState } from 'react';
import { z } from 'zod';
import { GameFormState } from '@/types';

// Move the validation schema here
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

export function useNewGameForm(onSubmit: (data: GameFormState) => void) {
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
        time: '', // This will be filled later if needed
        team_id: homeTeam,
        opponent_name: opponentName,
        location,
        periods,
        is_home: true,
        tracker_ids: [],
        // Add these for backwards compatibility
        homeTeam,
        opponentName,
      };
      onSubmit(formData);
    }
  };

  return {
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
  };
}
