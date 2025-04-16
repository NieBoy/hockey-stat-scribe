
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, User } from "lucide-react";
import { Link } from "react-router-dom";
import { mockTeams, currentUser } from "@/lib/mock-data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { useState } from "react";
import { toast } from "sonner";

export default function Teams() {
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    email: "",
    position: ""
  });

  const selectedTeam = selectedTeamId 
    ? mockTeams.find(team => team.id === selectedTeamId)
    : null;

  const handleAddPlayer = (teamId: string) => {
    setSelectedTeamId(teamId);
    setAddPlayerDialogOpen(true);
  };

  const submitNewPlayer = () => {
    if (!selectedTeam) return;
    
    if (newPlayer.name && newPlayer.email) {
      // In a real app, this would be an API call
      toast.success(`Player ${newPlayer.name} added to ${selectedTeam.name}!`);
      setAddPlayerDialogOpen(false);
      setNewPlayer({ name: "", email: "", position: "" });
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Teams</h1>
          <p className="text-muted-foreground">
            View and manage hockey teams.
          </p>
        </div>
        {currentUser.role.includes('coach') && (
          <Button asChild className="gap-2">
            <Link to="/teams/new">
              <Plus className="h-4 w-4" /> New Team
            </Link>
          </Button>
        )}
      </div>

      {mockTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Users className="h-4 w-4" />
                  <span>{team.players.length} Players</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Roster:</h3>
                  <div className="flex flex-wrap gap-2">
                    {team.players.slice(0, 3).map((player) => (
                      <div key={player.id} className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-sm">
                        <User className="h-3 w-3" />
                        <Link to={`/players/${player.id}`} className="hover:underline">
                          {player.name}
                        </Link>
                      </div>
                    ))}
                    {team.players.length > 3 && (
                      <div className="bg-muted/50 px-2 py-1 rounded-md text-sm">
                        +{team.players.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" asChild>
                  <Link to={`/teams/${team.id}`}>View Details</Link>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-1" 
                  onClick={() => handleAddPlayer(team.id)}
                >
                  <Plus className="h-4 w-4" /> Add Player
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No teams yet</h3>
          <p className="mt-1 text-muted-foreground">
            Create your first team to get started
          </p>
          {currentUser.role.includes('coach') && (
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Create New Team
            </Button>
          )}
        </div>
      )}

      {/* Add Player Dialog */}
      <Dialog open={addPlayerDialogOpen} onOpenChange={setAddPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player to {selectedTeam?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player-name" className="text-right">Name</Label>
              <Input 
                id="player-name" 
                value={newPlayer.name}
                onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                className="col-span-3" 
                placeholder="Player name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player-email" className="text-right">Email</Label>
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
              <Label htmlFor="player-position" className="text-right">Position</Label>
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={submitNewPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
