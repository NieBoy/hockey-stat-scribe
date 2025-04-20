
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PlayerStatsEmptyProps {
  gameStatsDebug: any[];
  playerGameEvents: any[] | undefined;
  onRefresh: () => void;
  playerId: string;
}

export default function PlayerStatsEmpty({ 
  gameStatsDebug, 
  playerGameEvents,
  onRefresh,
  playerId
}: PlayerStatsEmptyProps) {
  const [isPlayerValid, setIsPlayerValid] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [hasValidUserId, setHasValidUserId] = useState<boolean | null>(null);

  // Check if player exists in the team_members table and has a valid user_id
  useEffect(() => {
    const checkPlayerExists = async () => {
      if (!playerId) {
        setIsPlayerValid(false);
        setErrorDetails("Invalid player ID");
        return;
      }

      setChecking(true);
      try {
        // Check if player exists in team_members and has a valid user_id
        const { data: memberData, error: memberError } = await supabase
          .from('team_members')
          .select('id, name, user_id')
          .eq('id', playerId)
          .maybeSingle();
          
        if (memberError) {
          console.error("Error checking team_members table:", memberError);
          throw memberError;
        }
        
        if (memberData) {
          // Player exists in team_members
          setIsPlayerValid(true);
          
          // Check if the player has a valid user_id
          if (memberData.user_id) {
            setHasValidUserId(true);
            setErrorDetails(null);
          } else {
            setHasValidUserId(false);
            setErrorDetails("Player exists but does not have a user_id in the team_members table");
          }
          return;
        }
        
        // As fallback, check users table directly
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', playerId)
          .maybeSingle();
          
        if (userError) {
          console.error("Error checking users table:", userError);
          throw userError;
        }
        
        if (userData) {
          setIsPlayerValid(true);
          setHasValidUserId(true);
          setErrorDetails(null);
        } else {
          setIsPlayerValid(false);
          setErrorDetails("Player ID exists in game events but not in users or team_members tables");
        }
      } catch (error) {
        console.error("Error validating player:", error);
        setIsPlayerValid(false);
        setErrorDetails(error instanceof Error ? error.message : String(error));
      } finally {
        setChecking(false);
      }
    };

    checkPlayerExists();
  }, [playerId]);

  const handleRefresh = () => {
    if (!isPlayerValid) {
      toast.error("Cannot calculate stats", { 
        description: "The player ID is not valid in the database. This is likely a data consistency issue."
      });
      return;
    }

    if (!hasValidUserId) {
      toast.error("Cannot calculate stats", {
        description: "The player does not have a valid user_id in the team_members table."
      });
      return;
    }
    
    onRefresh();
  };

  // Show warning if player ID is invalid
  if (isPlayerValid === false) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12" />
        </div>
        <h3 className="font-medium text-lg mb-2">Player ID Not Found</h3>
        <p>The player ID ({playerId}) does not exist in the database.</p>
        {errorDetails && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded text-sm">
            <p className="font-medium">Error details:</p>
            <p>{errorDetails}</p>
          </div>
        )}
        <div className="mt-4">
          <p>This is likely a data integrity issue. Possible causes:</p>
          <ul className="list-disc list-inside text-left mt-2 text-sm">
            <li>The player was deleted but still has game events</li>
            <li>The player ID was changed or migrated incorrectly</li>
            <li>There's a mismatch between team_members and users tables</li>
          </ul>
        </div>
      </div>
    );
  }

  // Show warning if player has no valid user_id
  if (hasValidUserId === false) {
    return (
      <div className="text-center text-amber-600 p-4 bg-amber-50 border border-amber-200 rounded-md">
        <div className="flex justify-center mb-4">
          <Info className="h-12 w-12" />
        </div>
        <h3 className="font-medium text-lg mb-2">Missing User Association</h3>
        <p>This player exists in the team_members table but doesn't have a user_id.</p>
        
        <div className="mt-4">
          <p>This is a data consistency issue that needs to be fixed:</p>
          <ul className="list-disc list-inside text-left mt-2 text-sm">
            <li>The player needs to be associated with a user in the database</li>
            <li>Stats can only be recorded for players with a valid user_id</li>
            <li>This typically happens when a player is created through the team roster but not linked to a user account</li>
          </ul>
        </div>

        <div className="mt-4">
          <p className="font-medium">Possible solutions:</p>
          <ul className="list-disc list-inside text-left mt-2 text-sm">
            <li>Manually update the team_members table to add a user_id for this player</li>
            <li>Create a new user for this player and link them together</li>
          </ul>
        </div>
      </div>
    );
  }

  // Show checking state
  if (checking || isPlayerValid === null) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Validating player information...</p>
        <div className="flex justify-center mt-4">
          <RefreshCw className="h-6 w-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center text-muted-foreground">
      <p>No statistics available for this player.</p>
      <p className="mt-2 text-sm">This could mean:</p>
      <ul className="list-disc list-inside mt-1 text-sm">
        <li>The player hasn't participated in any games</li>
        <li>No stats have been recorded for this player</li>
        <li>Stats need to be refreshed from game data</li>
      </ul>
      
      {gameStatsDebug && gameStatsDebug.length > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md text-left">
          <p className="font-medium mb-2">Debug Information:</p>
          <p>Found {gameStatsDebug.length} raw game stats for this player that need to be processed.</p>
          <p className="mt-2">Try clicking the "Calculate Stats" button below to calculate statistics from game data.</p>
        </div>
      )}
      
      {playerGameEvents && playerGameEvents.length > 0 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md text-left">
          <p className="font-medium mb-2">Game Events Found:</p>
          <p>Found {playerGameEvents.length} game events for this player, but they haven't been processed into stats yet.</p>
          <p className="mt-2">Click the button below to create stats from these events.</p>
        </div>
      )}

      <div className="mt-4">
        <Button 
          onClick={handleRefresh} 
          className="gap-2"
          disabled={(!playerGameEvents || playerGameEvents.length === 0) || !isPlayerValid || !hasValidUserId}
        >
          <RefreshCw className="h-4 w-4" />
          Calculate Stats from Game Data
          {(!playerGameEvents || playerGameEvents.length === 0) && " (No Events Found)"}
        </Button>
      </div>
    </div>
  );
}
