
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LocationInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function LocationInput({ value, onChange, error }: LocationInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="location">Location</Label>
      <Input
        id="location"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter game location"
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
