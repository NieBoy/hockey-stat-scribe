
import { Button } from "@/components/ui/button";

interface PeriodSelectorProps {
  selectedPeriod: number;
  onPeriodChange: (period: number) => void;
}

export default function PeriodSelector({ selectedPeriod, onPeriodChange }: PeriodSelectorProps) {
  return (
    <div className="flex justify-center space-x-4 mb-4">
      {[1, 2, 3, 4].map((period) => (
        <Button
          key={period}
          variant={selectedPeriod === period ? "default" : "outline"}
          onClick={() => onPeriodChange(period)}
        >
          {period === 4 ? "Overtime" : `Period ${period}`}
        </Button>
      ))}
    </div>
  );
}
