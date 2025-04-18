
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ClipboardEdit, UserPlus, BarChart3 } from "lucide-react";

interface GameTabsProps {
  gameId: string;
  isCoach: boolean;
  isStatTracker: boolean;
  assignedStatTypes: string[];
}

export function GameTabs({ gameId, isCoach, isStatTracker, assignedStatTypes }: GameTabsProps) {
  return (
    <Tabs defaultValue="summary">
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="summary">Summary</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>

      <TabsContent value="summary">
        <Card>
          <CardHeader>
            <CardTitle>Game Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Track game events and stats to see a summary here.
            </p>
            <div className="mt-4 space-x-2">
              <Button asChild>
                <Link to={`/games/${gameId}/track`}>
                  <ClipboardEdit className="mr-2 h-4 w-4" /> Start Tracking Events
                </Link>
              </Button>
              {isCoach && (
                <Button variant="outline" asChild>
                  <Link to={`/games/${gameId}/assign-trackers`}>
                    <UserPlus className="mr-2 h-4 w-4" /> Assign Stat Trackers
                  </Link>
                </Button>
              )}
              {isStatTracker && (
                <Button variant="secondary" asChild>
                  <Link to={`/stats/track/${gameId}`}>
                    <BarChart3 className="mr-2 h-4 w-4" /> Track Stats ({assignedStatTypes.join(', ')})
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="events">
        <Card>
          <CardHeader>
            <CardTitle>Game Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track goals, penalties, and timeouts during the game.
            </p>
            <Button asChild>
              <Link to={`/games/${gameId}/track`}>
                <ClipboardEdit className="mr-2 h-4 w-4" /> Track Events
              </Link>
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats">
        <Card>
          <CardHeader>
            <CardTitle>Game Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Track detailed player statistics for this game.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {isStatTracker ? (
                <Button variant="default" asChild>
                  <Link to={`/stats/track/${gameId}`}>
                    <BarChart3 className="mr-2 h-4 w-4" /> Track Your Stats ({assignedStatTypes.join(', ')})
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link to={`/stats/track/${gameId}`}>
                    <BarChart3 className="mr-2 h-4 w-4" /> View Stats
                  </Link>
                </Button>
              )}
              {isCoach && (
                <Button variant="outline" asChild>
                  <Link to={`/games/${gameId}/assign-trackers`}>
                    <UserPlus className="mr-2 h-4 w-4" /> Assign Stat Trackers
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
