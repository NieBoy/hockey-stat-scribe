
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { User } from "@/types";

interface PlayerDetailsProps {
  player: User;
}

export default function PlayerDetails({ player }: PlayerDetailsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Player Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-semibold">Position: </span>
            <span>{player.position || "Not assigned"}</span>
          </div>
          <div>
            <span className="font-semibold">Number: </span>
            <span>{player.number || "Not assigned"}</span>
          </div>
          <div>
            <span className="font-semibold">Team: </span>
            <span>
              {player.teams && player.teams.length > 0
                ? player.teams[0].name
                : "Not assigned"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
