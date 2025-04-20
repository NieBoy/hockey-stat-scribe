
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/lib/supabase";
import { User, Position, UserRole } from "@/types";

export function usePlayerDetails(playerId: string | undefined) {
  const [player, setPlayer] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerDetails = useCallback(async () => {
    if (!playerId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching player details for ID:", playerId);
      
      // Get team member details
      const { data: memberData, error: memberError } = await supabase
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
        
      if (memberError) {
        console.error("Error fetching team member:", memberError);
        setError("Failed to fetch details");
        setLoading(false);
        return;
      }
      
      // Get team name
      let teamName = "";
      if (memberData.team_id) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .select('name')
          .eq('id', memberData.team_id)
          .single();
          
        if (!teamError && teamData) {
          teamName = teamData.name;
        }
      }

      // For parents, fetch their children
      let children = [];
      if (memberData.role === 'parent') {
        const { data: relationships, error: relError } = await supabase
          .from('player_parents')
          .select('player_id')
          .eq('parent_id', playerId);
          
        if (!relError && relationships && relationships.length > 0) {
          const playerIds = relationships.map(rel => rel.player_id);
          
          const { data: playersData, error: playersError } = await supabase
            .from('team_members')
            .select('id, name, role')
            .in('id', playerIds);
            
          if (!playersError && playersData) {
            children = playersData.map(p => ({
              id: p.id,
              name: p.name || 'Unknown Player',
              role: [p.role as UserRole || 'player']
            }));
          }
        }
      }
      
      const memberDetails: User = {
        id: memberData.id,
        name: memberData.name || 'Unknown Member',
        email: memberData.email || undefined,
        role: [memberData.role as UserRole || 'player'],
        position: memberData.position as Position,
        lineNumber: memberData.line_number,
        number: memberData.line_number ? String(memberData.line_number) : undefined,
        teams: teamName ? [{ 
          id: memberData.team_id, 
          name: teamName,
          players: [],
          coaches: [],
          parents: []
        }] : [],
        children: children.length > 0 ? children : undefined
      };
      
      setPlayer(memberDetails);
      setLoading(false);
    } catch (err) {
      console.error("Error in fetchPlayerDetails:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchPlayerDetails();
  }, [fetchPlayerDetails]);

  const refetchPlayer = useCallback(async () => {
    await fetchPlayerDetails();
  }, [fetchPlayerDetails]);

  return { player, loading, error, refetchPlayer };
}
