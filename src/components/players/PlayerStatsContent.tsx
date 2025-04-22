
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Define a simple game type that matches what we get from the API
interface SimpleGame {
  id: string;
  date: string;
  home_team_id?: string;
  away_team_id?: string;
  location: string;
}

interface PlayerStatsContentProps {
  stats: any[];
  showDebugInfo?: boolean;
  player: User | null;
  playerTeam: any;
  teamGames: SimpleGame[];
  rawGameStats: any[];
  playerGameEvents: any[];
  onRefresh: () => void;
  isRefreshing?: boolean;
  playerId: string;
  hasRawGameStats?: boolean;
  hasGameEvents?: boolean;
}

const PlayerStatsContent = ({
  stats,
  player,
  playerId,
  onRefresh,
  isRefreshing = false,
  hasRawGameStats = false,
  hasGameEvents = false
}: PlayerStatsContentProps) => {
  const [isFixingUser, setIsFixingUser] = useState(false);
  const hasStats = stats && stats.length > 0;
  const isPlayerValid = !!player;
  const hasValidUserId = !!player?.user_id;

  const handleFixUserAssociation = async () => {
    if (!playerId) {
      toast.error("Cannot fix user association without valid player data");
      return;
    }

    setIsFixingUser(true);
    try {
      toast.info("Checking user ID association...");
      
      // Check if player exists
      const { data: playerData, error: playerError } = await supabase
        .from('team_members')
        .select('id, name, user_id, email')
        .eq('id', playerId)
        .single();
        
      if (playerError || !playerData) {
        toast.error("Cannot retrieve player data");
        setIsFixingUser(false);
        return;
      }
      
      if (playerData.email) {
        const { data: emailUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', playerData.email)
          .single();
          
        if (emailUser) {
          const { error: updateError } = await supabase
            .from('team_members')
            .update({ user_id: emailUser.id })
            .eq('id', playerId);
            
          if (updateError) {
            toast.error("Failed to update team member with existing user ID");
            setIsFixingUser(false);
            return;
          }
          
          toast.success("Fixed user association", { 
            description: `Linked player to existing user with email ${playerData.email}`
          });
          
          setTimeout(() => {
            onRefresh();
          }, 1000);
          setIsFixingUser(false);
          return;
        }
        
        try {
          toast.info("Creating new user account...");
          const { data, error } = await supabase.functions.invoke('create-demo-user', {
            body: {
              email: playerData.email,
              password: "password123",
              name: playerData.name || "Player",
              teamMemberId: playerId
            }
          });
          
          if (error) {
            console.error("Error creating user:", error);
            toast.error("Failed to create user account");
            setIsFixingUser(false);
            return;
          }
          
          if (data && data.error) {
            console.error("Error returned from function:", data.error);
            toast.error(data.error);
            setIsFixingUser(false);
            return;
          }
          
          toast.success("Created new user account and linked to player", {
            description: "The player can now log in with the provided email"
          });
          
          setTimeout(() => {
            onRefresh();
          }, 1000);
          setIsFixingUser(false);
          return;
        } catch (err) {
          console.error("Error invoking edge function:", err);
          toast.error("Error creating user account");
          setIsFixingUser(false);
          return;
        }
      }
      
      // Generate a new user if no email exists
      const newUserId = crypto.randomUUID();
      const generatedEmail = `player_${newUserId.substring(0, 8)}@example.com`;
      
      const { error: createError } = await supabase
        .from('users')
        .insert({
          id: newUserId,
          name: playerData.name || 'Player',
          email: generatedEmail
        });
        
      if (createError) {
        console.error("Failed to create user:", createError);
        toast.error(`Failed to create user: ${createError.message}`);
        setIsFixingUser(false);
        return;
      }
      
      const { error: updateError } = await supabase
        .from('team_members')
        .update({ 
          user_id: newUserId,
          email: generatedEmail
        })
        .eq('id', playerId);
        
      if (updateError) {
        console.error("Failed to update team member:", updateError);
        toast.error(`Failed to update team member: ${updateError.message}`);
        setIsFixingUser(false);
        return;
      }
      
      toast.success("Created new user and linked to player", {
        description: "Please refresh the page to see the changes"
      });
      
      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error) {
      console.error("Error fixing user association:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsFixingUser(false);
    }
  };

  // Show simplified stats or empty state
  if (!hasStats) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">No Stats Available</h3>
            <p className="text-muted-foreground">
              {hasGameEvents 
                ? "Game events exist but no stats have been calculated." 
                : "No game events or stats found for this player."}
            </p>
            
            {hasGameEvents && (
              <Button 
                onClick={onRefresh} 
                disabled={isRefreshing || !isPlayerValid}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Calculate Stats from Game Events
              </Button>
            )}
            
            {!hasValidUserId && (
              <div className="mt-4 border border-orange-300 bg-orange-50 p-4 rounded-md">
                <h3 className="text-orange-800 font-medium">Missing User Association</h3>
                <p className="text-orange-700 mt-2">
                  This player doesn't have a valid user ID connection, which prevents stats from being recorded properly.
                </p>
                <Button 
                  variant="destructive"
                  onClick={handleFixUserAssociation}
                  disabled={isFixingUser}
                  className="mt-2"
                >
                  {isFixingUser ? "Fixing..." : "Fix User Association"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Simple stats display
  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Player Statistics</h3>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat, index) => (
              <div key={index} className="p-4 border rounded-lg bg-card">
                <h3 className="font-semibold text-lg capitalize">{stat.statType}</h3>
                <p className="text-3xl font-bold">{stat.value}</p>
                {stat.gamesPlayed > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {stat.gamesPlayed} {stat.gamesPlayed === 1 ? 'game' : 'games'} - 
                    {' '}{(stat.value / (stat.gamesPlayed || 1)).toFixed(2)} avg
                  </p>
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Button 
              onClick={onRefresh} 
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerStatsContent;
