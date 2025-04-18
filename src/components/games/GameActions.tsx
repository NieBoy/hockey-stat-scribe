
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ClipboardEdit, UserPlus, BarChart3 } from "lucide-react";

interface GameActionsProps {
  gameId: string;
  isCoach: boolean;
  isStatTracker: boolean;
  assignedStatTypes: string[];
}

export function GameActions({ gameId, isCoach, isStatTracker, assignedStatTypes }: GameActionsProps) {
  return (
    <div className="flex gap-2">
      <Button className="gap-2" asChild>
        <Link to={`/games/${gameId}/track`}>
          <ClipboardEdit className="h-4 w-4" /> Track Events
        </Link>
      </Button>
      {isCoach && (
        <Button variant="outline" className="gap-2" asChild>
          <Link to={`/games/${gameId}/assign-trackers`}>
            <UserPlus className="h-4 w-4" /> Assign Stat Trackers
          </Link>
        </Button>
      )}
      {isStatTracker && (
        <Button variant="secondary" className="gap-2" asChild>
          <Link to={`/stats/track/${gameId}`}>
            <BarChart3 className="h-4 w-4" /> Track Stats
          </Link>
        </Button>
      )}
    </div>
  );
}
