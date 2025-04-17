import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User, Position, UserRole } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerHeader from "@/components/players/PlayerHeader";
import PlayerDetails from "@/components/players/PlayerDetails";
import PlayerStats from "@/components/players/PlayerStats";
import PlayerParents from "@/components/players/PlayerParents";

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
          <PlayerHeader player={player} />
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
              <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
                <TabsTrigger value="parents">Parents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <PlayerDetails player={player} />
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4">
                <PlayerStats playerId={player.id} />
              </TabsContent>
              
              <TabsContent value="parents" className="space-y-4">
                <PlayerParents player={player} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
