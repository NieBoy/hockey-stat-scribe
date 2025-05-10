
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { GameEvent } from '@/types';

export function useGameEvents(gameId: string) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!gameId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('game_events')
        .select('*')
        .eq('game_id', gameId)
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      setEvents(data || []);
    } catch (err) {
      console.error('Error fetching game events:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching game events'));
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Setup realtime subscription
  useEffect(() => {
    if (!gameId) return;

    const channel = supabase
      .channel(`game_events_${gameId}`)
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'game_events',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          // Handle different event types
          if (payload.eventType === 'INSERT') {
            setEvents(prev => [payload.new as GameEvent, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setEvents(prev => prev.filter(event => event.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setEvents(prev => 
              prev.map(event => 
                event.id === payload.new.id ? payload.new as GameEvent : event
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const addEvent = async (eventData: Partial<GameEvent>) => {
    if (!gameId) return null;

    try {
      const { data, error } = await supabase
        .from('game_events')
        .insert({
          ...eventData,
          game_id: gameId,
          timestamp: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    } catch (err) {
      console.error('Error adding game event:', err);
      return null;
    }
  };

  return {
    events,
    loading,
    error,
    refetchEvents: fetchEvents,
    addEvent
  };
}
