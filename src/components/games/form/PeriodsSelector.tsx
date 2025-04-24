
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PeriodsSelectorProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export function PeriodsSelector({ value, onChange, error }: PeriodsSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="periods">Number of Periods</Label>
      <Select
        value={value.toString()}
        onValueChange={(value) => onChange(parseInt(value))}
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
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
