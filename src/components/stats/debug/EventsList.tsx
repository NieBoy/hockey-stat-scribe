
import React from "react";

interface EventsListProps {
  events: any[];
}

export const EventsList = ({ events }: EventsListProps) => {
  if (events.length === 0) return null;

  return (
    <div className="mt-2">
      <p className="text-xs font-medium mb-1">Game Events Being Processed ({events.length})</p>
      <div className="bg-muted p-2 rounded text-xs overflow-auto max-h-20">
        <pre>{JSON.stringify(events, null, 2)}</pre>
      </div>
    </div>
  );
};
