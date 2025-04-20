
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Pencil } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerHeader from "@/components/players/PlayerHeader";
import PlayerDetails from "@/components/players/PlayerDetails";
import PlayerStats from "@/components/players/PlayerStats";
import PlayerParents from "@/components/players/PlayerParents";
import { usePlayerDetails } from "@/hooks/usePlayerDetails";
import EditMemberDialog from "@/components/profile/EditMemberDialog";
import { toast } from "sonner";
import { updateTeamMemberInfo } from "@/services/teams/memberUpdateService";

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const { player, loading, error, refetchPlayer } = usePlayerDetails(id);
  const [activeTab, setActiveTab] = useState("details");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Determine if this is a parent profile rather than a player
  const isParentProfile = player?.role?.includes('parent');

  const handleEditSubmit = async (updatedData: {
    name?: string;
    email?: string;
    position?: string;
    number?: string;
  }) => {
    if (!player?.id) return;
    
    try {
      // Get the team ID from the player's teams array
      const teamId = player.teams?.[0]?.id;
      if (!teamId) {
        throw new Error("No team found for this player");
      }

      await updateTeamMemberInfo(teamId, player.id, updatedData);
      
      toast.success("Profile updated successfully");
      setIsEditDialogOpen(false);
      // Refresh player data
      refetchPlayer();
    } catch (error: any) {
      console.error("Error updating player:", error);
      toast.error("Failed to update profile", {
        description: error.message,
        duration: 5000
      });
    }
  };

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
          <Button 
            onClick={() => setIsEditDialogOpen(true)}
            size="sm"
            className="gap-2"
          >
            <Pencil className="h-4 w-4" />
            Edit Profile
          </Button>
        </div>

        <Card>
          <PlayerHeader player={player} />
          <CardContent>
            {isParentProfile ? (
              // Parent profile view shows different tabs
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="children">Children</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <PlayerDetails player={player} />
                </TabsContent>
                
                <TabsContent value="children" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Children</h3>
                    {player.children && player.children.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {player.children.map(child => (
                          <Card key={child.id} className="p-4">
                            <div className="font-medium">
                              <Link to={`/players/${child.id}`} className="hover:underline text-primary">
                                {child.name}
                              </Link>
                            </div>
                            <div className="text-sm text-muted-foreground">Player</div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No children associated with this parent.</p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              // Regular player profile tabs
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
            )}
          </CardContent>
        </Card>
      </div>

      <EditMemberDialog 
        member={isEditDialogOpen ? player : null}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleEditSubmit}
      />
    </MainLayout>
  );
}
