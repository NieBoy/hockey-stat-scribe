
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import { GameStat, StatType } from "@/types";

interface StatCardProps {
  playerId: string;
  playerName: string;
  teamName: string;
  statType: StatType;
  currentValue: number;
  onRecord: (value: number) => void;
  showWonLost?: boolean;
}

export default function StatCard({
  playerId,
  playerName,
  teamName,
  statType,
  currentValue,
  onRecord,
  showWonLost = false,
}: StatCardProps) {
  if (showWonLost) {
    const wonValue = currentValue > 0 ? currentValue : 0;
    const lostValue = currentValue < 0 ? Math.abs(currentValue) : 0;

    return (
      <Card className="border-2 hover:border-primary/50">
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm">{playerName}</CardTitle>
          <CardDescription className="text-xs">{teamName}</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-2">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Won</div>
              <div className="text-lg font-bold">{wonValue}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Lost</div>
              <div className="text-lg font-bold">{lostValue}</div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-3 pt-0 flex justify-between">
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1"
            onClick={() => onRecord(1)}
          >
            <PlusCircle className="h-3 w-3" /> Won
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1"
            onClick={() => onRecord(-1)}
          >
            <MinusCircle className="h-3 w-3" /> Lost
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-2 hover:border-primary/50">
      <CardHeader className="p-3 pb-0">
        <CardTitle className="text-sm">{playerName}</CardTitle>
        <CardDescription className="text-xs">{teamName}</CardDescription>
      </CardHeader>
      <CardFooter className="p-3 pt-0 flex justify-between">
        <span className="text-lg font-bold">{currentValue}</span>
        <Button 
          size="sm"
          variant="outline"
          className="gap-1"
          onClick={() => onRecord(1)}
        >
          <PlusCircle className="h-4 w-4" />
          Record
        </Button>
      </CardFooter>
    </Card>
  );
}
