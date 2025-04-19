import { useState } from 'react';
import { EventType, FlowState } from '@/types/events';

export function useEventSelection() {
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [flowState, setFlowState] = useState<FlowState>('buttons');

  const handleEventSelect = (gameStatus: string, gameId: string | undefined, eventType: EventType) => {
    if (!gameId || gameStatus !== 'in-progress') {
      console.log("Cannot record event - game not in progress:", gameStatus);
      return;
    }

    setSelectedEvent(eventType);

    switch (eventType) {
      case 'goal':
        setFlowState('goal-flow');
        break;
      case 'penalty':
        setFlowState('penalty-flow');
        break;
      case 'faceoff':
        setFlowState('faceoff-flow');
        break;
      case 'shot':
        setFlowState('shot-flow');
        break;
      case 'hits':
        setFlowState('hits-flow');
        break;
    }
  };

  const handleFlowComplete = () => {
    setFlowState('buttons');
    setSelectedEvent(null);
  };

  const handleFlowCancel = () => {
    setFlowState('buttons');
    setSelectedEvent(null);
  };

  return {
    selectedEvent,
    flowState,
    handleEventSelect,
    handleFlowComplete,
    handleFlowCancel
  };
}
