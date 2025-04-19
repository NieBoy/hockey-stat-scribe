
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
import { useToast } from "@/components/ui/use-toast";

interface Event {
  id: string;
  event_type: string;
  team_type: string;
  period: number;
  timestamp: string;
}

interface EventHistoryProps {
  gameId: string;
  onEventDeleted?: () => void;
}

export default function EventHistory({ gameId, onEventDeleted }: EventHistoryProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setIsLoading(true);
    console.log('Fetching events for game ID:', gameId);
    
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
    setIsLoading(false);
  };

  const deleteEvent = async (eventId: string) => {
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

    fetchEvents();
    if (onEventDeleted) onEventDeleted();
  };

  useEffect(() => {
    if (gameId) {
      fetchEvents();
    }
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;

    // Set up real-time subscription
    const channel = supabase
      .channel('game_events_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_events',
          filter: `game_id=eq.${gameId}`
        },
        (payload) => {
          console.log('Game event change detected:', payload);
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
      <h3 className="text-lg font-semibold mb-4">Event History</h3>
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
