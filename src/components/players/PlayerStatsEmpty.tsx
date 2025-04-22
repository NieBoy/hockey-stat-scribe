
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getOrCreatePlayerUser } from "@/services/teams/userService";
import InvalidPlayerError from "./stats/empty-state/InvalidPlayerError";
import MissingUserAssociation from "./stats/empty-state/MissingUserAssociation";
import EmptyStatsContent from "./stats/empty-state/EmptyStatsContent";

interface PlayerStatsEmptyProps {
  gameStatsDebug: any[];
  playerGameEvents: any[] | undefined;
  onRefresh: () => void;
  playerId: string;
  hasRawGameStats?: boolean;
  hasGameEvents?: boolean;
}

export default function PlayerStatsEmpty({ 
  gameStatsDebug, 
  playerGameEvents,
  onRefresh,
  playerId,
  hasRawGameStats = false,
  hasGameEvents = false
}: PlayerStatsEmptyProps) {
  const [isPlayerValid, setIsPlayerValid] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [hasValidUserId, setHasValidUserId] = useState<boolean | null>(null);
  const [playerName, setPlayerName] = useState<string>("");
  const [playerEmail, setPlayerEmail] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    const checkPlayerExists = async () => {
      if (!playerId) {
        setIsPlayerValid(false);
        setErrorDetails("Invalid player ID");
        return;
      }

      setChecking(true);
      try {
        const { data: memberData, error: memberError } = await supabase
          .from('team_members')
          .select('id, name, email, user_id')
          .eq('id', playerId)
          .maybeSingle();
          
        if (memberError) {
          console.error("Error checking team_members table:", memberError);
          throw memberError;
        }
        
        if (memberData) {
          setIsPlayerValid(true);
          setPlayerName(memberData.name || 'Unknown Player');
          setPlayerEmail(memberData.email || null);
          setHasValidUserId(!!memberData.user_id);
          setErrorDetails(memberData.user_id ? null : "Player exists but does not have a user_id in the team_members table");
          return;
        }
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', playerId)
          .maybeSingle();
          
        if (userError) {
          console.error("Error checking users table:", userError);
          throw userError;
        }
        
        setIsPlayerValid(!!userData);
        setHasValidUserId(!!userData);
        setErrorDetails(userData ? null : "Player ID exists in game events but not in users or team_members tables");
      } catch (error) {
        console.error("Error validating player:", error);
        setIsPlayerValid(false);
        setErrorDetails(error instanceof Error ? error.message : String(error));
      } finally {
        setChecking(false);
      }
    };

    checkPlayerExists();
  }, [playerId, retries]);

  const handleRefresh = () => {
    if (!isPlayerValid) {
      toast.error("Cannot calculate stats", { 
        description: "The player ID is not valid in the database. This is likely a data consistency issue."
      });
      return;
    }
    
    onRefresh();
  };

  const handleCreateUserForPlayer = async () => {
    if (!playerName) {
      toast.error("Missing player name", {
        description: "Cannot create user account without a player name"
      });
      return;
    }

    setCreatingUser(true);
    try {
      const userId = await getOrCreatePlayerUser({
        name: playerName,
        email: playerEmail || undefined
      });

      console.log(`Created/found user with ID ${userId} for player ${playerId}`);

      const { error: updateError } = await supabase
        .from('team_members')
        .update({ user_id: userId })
        .eq('id', playerId);

      if (updateError) {
        console.error("Error updating player with user_id:", updateError);
        throw updateError;
      }

      toast.success("User association fixed", {
        description: "Successfully created and linked a user account for this player"
      });

      setRetries(prev => prev + 1);
      
    } catch (error) {
      console.error("Error creating user for player:", error);
      
      let errorMessage = "An unexpected error occurred";
      if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
        
        if (errorMessage.includes("foreign key constraint")) {
          errorMessage = "There is a database constraint issue. The system administrator needs to check the database configuration.";
        }
      }
      
      toast.error("Failed to create user", {
        description: errorMessage
      });
    } finally {
      setCreatingUser(false);
    }
  };

  if (isPlayerValid === false) {
    return <InvalidPlayerError playerId={playerId} errorDetails={errorDetails} />;
  }

  if (hasValidUserId === false) {
    return (
      <MissingUserAssociation 
        playerName={playerName}
        onCreateUser={handleCreateUserForPlayer}
        creatingUser={creatingUser}
      />
    );
  }

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
    <EmptyStatsContent
      onRefresh={handleRefresh}
      gameStatsDebug={gameStatsDebug}
      playerGameEvents={playerGameEvents}
      isPlayerValid={isPlayerValid}
      hasValidUserId={hasValidUserId}
      playerId={playerId}
      hasRawGameStats={hasRawGameStats}
      hasGameEvents={hasGameEvents}
    />
  );
}
