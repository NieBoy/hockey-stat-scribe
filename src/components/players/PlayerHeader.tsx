
import { CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";
import PlayerAvatar from "./PlayerAvatar";

interface PlayerHeaderProps {
  player: User;
}

export default function PlayerHeader({ player }: PlayerHeaderProps) {
  return (
    <CardHeader className="pb-2">
      <div className="flex items-center gap-4">
        <PlayerAvatar name={player.name} />
        <div>
          <CardTitle className="text-2xl">{player.name}</CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground">
            {player.number && <span>#{player.number}</span>}
            {player.position && (
              <>
                {player.number && <span>•</span>}
                <span>{player.position}</span>
              </>
            )}
            {player.teams && player.teams.length > 0 && (
              <>
                <span>•</span>
                <span>{player.teams[0].name}</span>
              </>
            )}
          </div>
          {player.email && (
            <div className="text-sm text-muted-foreground mt-1">
              {player.email}
            </div>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
