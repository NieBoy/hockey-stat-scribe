import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LineChart, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { User, Position, UserRole } from "@/types";
import ParentPlayerManager from "@/components/teams/ParentPlayerManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getUserInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
};

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddParent, setShowAddParent] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    async function fetchPlayerDetails() {
      setLoading(true);
      try {
        console.log("Fetching player details for ID:", id);
        
        const { data: playerData, error: playerError } = await supabase
          .from('team_members')
          .select(`
            id,
            user_id,
            name,
            email,
            role,
            position,
            line_number,
            team_id
          `)
          .eq('id', id)
          .single();
          
        if (playerError) {
          console.error("Error fetching player:", playerError);
          setError("Failed to fetch player details");
          setLoading(false);
          return;
        }
        
        let teamName = "";
        if (playerData.team_id) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('name')
            .eq('id', playerData.team_id)
            .single();
            
          if (!teamError && teamData) {
            teamName = teamData.name;
          }
        }
        
        const playerDetails: User = {
          id: playerData.id,
          name: playerData.name || 'Unknown Player',
          email: playerData.email || undefined,
          role: [playerData.role as UserRole || 'player'],
          position: playerData.position as Position,
          lineNumber: playerData.line_number,
          number: playerData.line_number ? String(playerData.line_number) : undefined,
          teams: teamName ? [{ 
            id: playerData.team_id, 
            name: teamName,
            players: [],
            coaches: [],
            parents: []
          }] : []
        };
        
        setPlayer(playerDetails);
        setLoading(false);
      } catch (err) {
        console.error("Error in fetchPlayerDetails:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    }

    if (id) {
      fetchPlayerDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !player) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Button variant="outline" asChild>
            <Link to="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-500">{error || "Player not found"}</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="outline" asChild>
            <Link to="/teams">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teams
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {getUserInitials(player?.name || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{player?.name}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  {player?.number && <span>#{player.number}</span>}
                  {player?.position && (
                    <>
                      {player.number && <span>•</span>}
                      <span>{player.position}</span>
                    </>
                  )}
                  {player?.teams && player.teams.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{player.teams[0].name}</span>
                    </>
                  )}
                </div>
                {player?.email && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {player.email}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="parents">Parents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Player Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <span className="font-semibold">Position: </span>
                        <span>{player?.position || "Not assigned"}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Number: </span>
                        <span>{player?.number || "Not assigned"}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Team: </span>
                        <span>
                          {player?.teams && player.teams.length > 0
                            ? player.teams[0].name
                            : "Not assigned"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Player Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-32">
                      <Link to={`/players/${player?.id}/stats`}>
                        <Button className="gap-2">
                          <LineChart className="h-4 w-4" />
                          View Full Stats
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="parents" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Parents</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => setShowAddParent(!showAddParent)}
                  >
                    <UserPlus className="h-3 w-3" /> 
                    {showAddParent ? 'Hide' : 'Add Parent'}
                  </Button>
                </div>
                
                {showAddParent && player && (
                  <div className="mb-4">
                    <ParentPlayerManager 
                      player={player} 
                      onParentAdded={() => setShowAddParent(false)}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
