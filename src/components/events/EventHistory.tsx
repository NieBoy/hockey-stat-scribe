
import { useEffect, useState } from 'react';
import { format } from "date-fns";
import { supabase } from '@/lib/supabase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw } from "lucide-react";
import { Database } from '@/types/supabase';

type GameEvent = Database['public']['Tables']['game_events']['Row'];

interface EventHistoryProps {
  gameId: string;
  onEventDeleted?: () => void;
}

export default function EventHistory({ gameId, onEventDeleted }: EventHistoryProps) {
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setIsLoading(true);
    console.log('Fetching events for game ID:', gameId);
    
    try {
      const { data, error } = await supabase
        .from('game_events')
        .select('*')
        .eq('game_id', gameId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load events. Please refresh the page.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log('Events fetched:', data);
      setEvents(data || []);
    } catch (err) {
      console.error('Error in fetchEvents:', err);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('game_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Event Deleted",
        description: "The event has been successfully removed."
      });

      // Refresh the events list
      fetchEvents();
      if (onEventDeleted) onEventDeleted();
    } catch (err) {
      console.error('Error deleting event:', err);
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Set up a real-time subscription to events
  useEffect(() => {
    fetchEvents();
    
    // Subscribe to real-time updates for this game's events
    const channel = supabase
      .channel('game-events-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_events',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          console.log('Game event changed, refreshing...');
          fetchEvents();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Event History</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchEvents}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  Loading events...
                </TableCell>
              </TableRow>
            ) : events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  No events recorded yet
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    {format(new Date(event.timestamp), 'HH:mm:ss')}
                  </TableCell>
                  <TableCell className="capitalize">{event.event_type}</TableCell>
                  <TableCell className="capitalize">{event.team_type}</TableCell>
                  <TableCell>{event.period}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
