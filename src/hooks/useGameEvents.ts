
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GameEvent } from '@/types';
import { toast } from 'sonner';

export function useGameEvents(gameId: string) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!gameId) {
        setEvents([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch events for this game
        const { data, error } = await supabase.rpc('get_game_events', {
          p_game_id: gameId
        });

        if (error) throw error;
        
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching game events:', error);
        toast.error('Failed to load game events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    // Setup subscription for real-time updates
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
        () => {
          // Refetch events when something changes
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const addEvent = async (eventData: Partial<GameEvent>) => {
    try {
      if (!gameId) {
        toast.error('Game ID is missing');
        return null;
      }

      const { data, error } = await supabase.rpc('create_game_event', {
        p_game_id: gameId,
        p_event_type: eventData.event_type,
        p_period: eventData.period,
        p_team_type: eventData.team_type,
        p_details: eventData.details
      });

      if (error) throw error;
      
      toast.success('Event recorded successfully');
      return data;
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Failed to record event');
      return null;
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.rpc('delete_game_event', {
        p_event_id: eventId
      });

      if (error) throw error;
      
      toast.success('Event deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return false;
    }
  };

  return {
    events,
    loading,
    addEvent,
    deleteEvent
  };
}
