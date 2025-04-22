
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { Link } from "react-router-dom";
import PlayerStatsContent from "./stats/PlayerStatsContent";

interface PlayerStatsProps {
  playerId: string; // This is team_member.id
  playerName?: string;
  minimal?: boolean;
}

export default function PlayerStats({ playerId, playerName, minimal = true }: PlayerStatsProps) {
  if (minimal) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Player Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Link to={`/players/${playerId}/stats`}>
              <Button className="gap-2">
                <Activity className="h-4 w-4" />
                View Full Stats
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return <PlayerStatsContent playerId={playerId} />;
}
