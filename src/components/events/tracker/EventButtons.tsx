
import { Trophy, Flag, Target, Shield } from 'lucide-react';
import EventButton from '../EventButton';
import { EventType } from '@/types/events';

interface EventButtonsProps {
  onEventSelect: (eventType: EventType) => void;
}

export function EventButtons({ onEventSelect }: EventButtonsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <EventButton
        label="Goal"
        icon={<Trophy className="h-8 w-8" />}
        onClick={() => onEventSelect('goal')}
        className="bg-green-500 hover:bg-green-600"
      />
      <EventButton
        label="Penalty"
        icon={<Flag className="h-8 w-8" />}
        onClick={() => onEventSelect('penalty')}
        className="bg-red-500 hover:bg-red-600"
      />
      <EventButton
        label="Faceoff"
        icon={<Target className="h-8 w-8" rotate={45} />}
        onClick={() => onEventSelect('faceoff')}
        className="bg-blue-500 hover:bg-blue-600"
      />
      <EventButton
        label="Shot"
        icon={<Target className="h-8 w-8" />}
        onClick={() => onEventSelect('shot')}
        className="bg-purple-500 hover:bg-purple-600"
      />
      <EventButton
        label="Hit"
        icon={<Shield className="h-8 w-8" />}
        onClick={() => onEventSelect('hits')}
        className="bg-orange-500 hover:bg-orange-600"
      />
    </div>
  );
}
