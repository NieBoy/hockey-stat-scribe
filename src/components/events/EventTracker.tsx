
import { useState } from 'react';
import { Trophy, Flag, Clock } from 'lucide-react';
import EventButton from './EventButton';
import { Card } from "@/components/ui/card";

type EventType = 'goal' | 'penalty' | 'timeout';

export default function EventTracker() {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const handleEventSelect = (eventType: EventType) => {
    setSelectedEvent(eventType);
    console.log('Selected event:', eventType);
    // We'll implement the event flow logic in the next step
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EventButton
            label="Goal"
            icon={<Trophy className="h-8 w-8" />}
            onClick={() => handleEventSelect('goal')}
            className="bg-green-500 hover:bg-green-600"
          />
          <EventButton
            label="Penalty"
            icon={<Flag className="h-8 w-8" />}
            onClick={() => handleEventSelect('penalty')}
            className="bg-red-500 hover:bg-red-600"
          />
          <EventButton
            label="Timeout"
            icon={<Clock className="h-8 w-8" />}
            onClick={() => handleEventSelect('timeout')}
            className="bg-blue-500 hover:bg-blue-600 md:col-span-2"
          />
        </div>
      </Card>
    </div>
  );
}
