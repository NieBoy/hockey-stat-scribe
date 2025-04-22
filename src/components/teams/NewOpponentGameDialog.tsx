
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
import { supabase } from "@/lib/supabase";
import { Label } from "@/components/ui/label";

interface NewOpponentGameDialogProps {
  open: boolean;
  setOpen: (b: boolean) => void;
  teamId: string;
  teamName: string;
}

export default function NewOpponentGameDialog({
  open,
  setOpen,
  teamId,
  teamName
}: NewOpponentGameDialogProps) {
  const [date, setDate] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = date && opponentName && location;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("games").insert({
        date,
        location,
        home_team_id: teamId,
        away_team_id: null,
        opponent_name: opponentName,
        periods: 3,
        is_active: false,
        current_period: 0
      });
      if (error) throw error;
      toast.success("Game scheduled successfully!");
      setOpen(false);
      setOpponentName("");
      setLocation("");
      setDate("");
    } catch (err) {
      console.error("Error scheduling game:", err);
      toast.error("Error scheduling game");
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
