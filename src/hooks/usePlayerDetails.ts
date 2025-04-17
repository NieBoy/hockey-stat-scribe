
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { User, Position, UserRole } from "@/types";

export function usePlayerDetails(playerId: string | undefined) {
  const [player, setPlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlayerDetails() {
      if (!playerId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching player details for ID:", playerId);
        
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
          .eq('id', playerId)
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

    fetchPlayerDetails();
  }, [playerId]);

  return { player, loading, error };
}
