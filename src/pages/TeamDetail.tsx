import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { mockTeams, mockUsers } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  User, 
  UserCog,
  PanelLeftClose,
  Plus,
  ArrowLeft,
  LineChart,
  X
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function TeamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("players");
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    email: "",
    position: "",
    number: ""
  });
  
  const team = mockTeams.find(team => team.id === id);
  
  if (!team) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Team Not Found</h1>
          <p>The team you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };
  
  const handleAddPlayer = () => {
    // In a real app, this would be an API call
    if (newPlayer.name) {
      // Create a new player and add to team
      const newPlayerId = `player-${Date.now()}`;
      const playerToAdd = {
        id: newPlayerId,
        name: newPlayer.name,
        email: newPlayer.email,
        position: newPlayer.position,
        number: newPlayer.number,
        role: ["player"],
        teams: [{ id: team.id, name: team.name }]
      };
      
      // In a real app, we would update the backend
      // For now, just show a success message
      toast.success(`Player ${newPlayer.name} added to team!`);
      setAddPlayerDialogOpen(false);
      setNewPlayer({ name: "", email: "", position: "", number: "" });
    } else {
      toast.error("Player name is required");
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2" 
          onClick={() => navigate("/teams")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Teams
        </Button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{team.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {team.players.length} players • {team.coaches.length} coaches
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2" asChild>
              <Link to={`/teams/${id}/lineup`}>
                <PanelLeftClose className="h-4 w-4" />
                Lineup Editor
              </Link>
            </Button>
            <Button className="gap-2" onClick={() => setAddPlayerDialogOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Player
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="players" className="space-y-4">
            {team.players.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.players.map(player => (
                  <Card key={player.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getUserInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base font-medium">
                            <Link 
                              to={`/players/${player.id}`} 
                              className="hover:underline"
                            >
                              {player.name}
                            </Link>
                          </CardTitle>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {player.number && <span>#{player.number}</span>}
                            {player.position && (
                              <>
                                {player.number && <span>•</span>}
                                <span>{player.position}</span>
                                {player.lineNumber && <span> (Line {player.lineNumber})</span>}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {player.email && (
                        <div className="text-sm text-muted-foreground mb-2">
                          {player.email}
                        </div>
                      )}
                      <div className="flex mt-2 gap-2">
                        <Button variant="outline" size="sm" className="gap-1" asChild>
                          <Link to={`/players/${player.id}/stats`}>
                            <LineChart className="h-3 w-3" /> Stats
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="pt-6 pb-6 text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No players found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This team doesn't have any players yet.
                  </p>
                  <Button className="mt-4" onClick={() => setAddPlayerDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Player
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="coaches" className="space-y-4">
            {team.coaches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.coaches.map(coach => (
                  <Card key={coach.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getUserInitials(coach.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base font-medium">
                            <Link 
                              to={`/players/${coach.id}`} 
                              className="hover:underline"
                            >
                              {coach.name}
                            </Link>
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground mb-2">
                        {coach.email}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-muted/30">
                <CardContent className="pt-6 pb-6 text-center">
                  <UserCog className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No coaches found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This team doesn't have any coaches yet.
                  </p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Add Coach
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <div className="text-center py-10">
              <LineChart className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">Team stats coming soon</h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                This feature is still under development. Check back soon to view team statistics.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Player Dialog */}
      <Dialog open={addPlayerDialogOpen} onOpenChange={setAddPlayerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Player to {team.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="button" onClick={handleAddPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
