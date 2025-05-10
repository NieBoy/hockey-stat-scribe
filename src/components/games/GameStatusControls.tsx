
import { Button } from "@/components/ui/button";
import { PlayCircle, PauseCircle, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GameStatusControlsProps {
  isActive: boolean;
  currentPeriod: number;
  totalPeriods: number;
  onPeriodChange: (period: number) => void;
  onToggleStatus: () => void;
}

export default function GameStatusControls({
  isActive,
  currentPeriod,
  totalPeriods,
  onPeriodChange,
  onToggleStatus
}: GameStatusControlsProps) {
  const periods = Array.from({ length: totalPeriods }, (_, i) => i + 1);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Period:</span>
        </div>
        
        <Select 
          value={String(currentPeriod)} 
          onValueChange={(value) => onPeriodChange(parseInt(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Select Period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period} value={String(period)}>
                Period {period}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Button
          variant={isActive ? "destructive" : "default"}
          className="gap-2"
          onClick={onToggleStatus}
        >
          {isActive ? (
            <>
              <PauseCircle className="h-4 w-4" />
              Pause Game
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Resume Game
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
