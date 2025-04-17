
import React from "react";
import { 
  Dialog,
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Team } from "@/types";

interface AddPlayerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTeam: Team | null;
  onSubmit: () => void;
  newPlayer: {
    name: string;
    email: string;
    position: string;
    number: string;
  };
  setNewPlayer: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    position: string;
    number: string;
  }>>;
}

export default function AddPlayerDialog({
  isOpen,
  onOpenChange,
  selectedTeam,
  onSubmit,
  newPlayer,
  setNewPlayer,
}: AddPlayerDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Player to {selectedTeam?.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player-name" className="text-right">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="player-name" 
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
              className="col-span-3" 
              placeholder="Player name"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player-number" className="text-right">
              Number <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="player-number" 
              value={newPlayer.number}
              onChange={(e) => setNewPlayer({...newPlayer, number: e.target.value})}
              className="col-span-3" 
              placeholder="Jersey number"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player-email" className="text-right">
              Email <span className="text-gray-400">(optional)</span>
            </Label>
            <Input 
              id="player-email" 
              value={newPlayer.email}
              onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})}
              className="col-span-3" 
              type="email"
              placeholder="player@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="player-position" className="text-right">
              Position <span className="text-gray-400">(optional)</span>
            </Label>
            <Select 
              value={newPlayer.position} 
              onValueChange={(value) => setNewPlayer({...newPlayer, position: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Center">Center</SelectItem>
                <SelectItem value="Left Wing">Left Wing</SelectItem>
                <SelectItem value="Right Wing">Right Wing</SelectItem>
                <SelectItem value="Left Defense">Left Defense</SelectItem>
                <SelectItem value="Right Defense">Right Defense</SelectItem>
                <SelectItem value="Goalie">Goalie</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit">Add Player</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
