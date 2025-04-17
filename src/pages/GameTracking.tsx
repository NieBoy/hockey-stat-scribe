
import MainLayout from "@/components/layout/MainLayout";
import { useParams } from "react-router-dom";
import EventTracker from "@/components/events/EventTracker";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function GameTracking() {
  const { id } = useParams<{ id: string }>();

  return (
    <MainLayout>
      <div className="mb-6">
        <Button variant="ghost" className="gap-1 mb-4" asChild>
          <Link to={`/games/${id}`}>
            <ArrowLeft className="h-4 w-4" /> Back to Game
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Track Game Events</h1>
        <p className="text-muted-foreground">
          Click on an event type to record it for the current game.
        </p>
      </div>

      <EventTracker />
    </MainLayout>
  );
}
