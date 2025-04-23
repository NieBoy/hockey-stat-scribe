
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase"; // Use the main supabase client
import { Label } from "@/components/ui/label";

interface NewOpponentGameDialogProps {
  open: boolean;
  setOpen: (b: boolean) => void;
  teamId: string;
  teamName: string;
  onGameAdded?: () => void; // callback
}

export default function NewOpponentGameDialog({
  open,
  setOpen,
  teamId,
  teamName,
  onGameAdded
}: NewOpponentGameDialogProps) {
  const [date, setDate] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = date && opponentName && location;

  function toISOStringLocal(datetime: string) {
    // Converts a "YYYY-MM-DDTHH:mm" string (from <input type="datetime-local"/>) to UTC ISO
    try {
      const dt = new Date(datetime);
      return new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString();
    } catch {
      return datetime;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const isoDate = toISOStringLocal(date);
      console.log("Scheduling opponent game: ", {
        date,
        isoDate,
        teamId,
        opponentName,
        location
      });

      const { error, data } = await supabase
        .from("games")
        .insert({
          date: isoDate,
          location,
          home_team_id: teamId,
          away_team_id: null, // explicitly set to null for opponent games
          opponent_name: opponentName,
          periods: 3,
          is_active: false,
          current_period: 0
        })
        .select();

      if (error) {
        console.error("Supabase insert error:", error);
        toast.error("Error scheduling game: " + (error.message || "Unknown error"));
        return;
      }

      // Debug: Output the full data from the DB insert for troubleshooting
      console.log("Game insert result:", data);
      if (data && data.length > 0) {
        toast.success("Game scheduled successfully! (ID: " + data[0].id + ")");
      } else {
        toast.success("Game scheduled successfully (but no ID returned).");
      }

      setOpen(false); // close the dialog

      // Reset form state
      setOpponentName("");
      setLocation("");
      setDate("");

      // Call the callback to refresh the schedule
      if (onGameAdded) {
        console.log("Calling onGameAdded callback to refresh schedule");
        onGameAdded();
      }
    } catch (err) {
      console.error("Error scheduling game:", err);
      toast.error("Error scheduling game, see console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Game vs Opponent</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label>Date &amp; Time</Label>
            <Input
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label>Opponent Name</Label>
            <Input
              value={opponentName}
              onChange={e => setOpponentName(e.target.value)}
              placeholder="e.g. Springfield Cougars"
              required
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Main Arena"
              required
            />
          </div>
          <DialogFooter>
            <Button disabled={!canSubmit || loading} type="submit">
              {loading ? "Saving…" : "Add Game"}
            </Button>
            <DialogClose asChild>
              <Button variant="secondary" type="button" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
