
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart } from "lucide-react";
import { Link } from "react-router-dom";

interface PlayerStatsProps {
  playerId: string;
}

export default function PlayerStats({ playerId }: PlayerStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Player Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-32">
          <Link to={`/players/${playerId}/stats`}>
            <Button className="gap-2">
              <LineChart className="h-4 w-4" />
              View Full Stats
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
