
import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface ParentPlayerManagerProps {
  player: User;
  onParentAdded: () => void;
}

export default function ParentPlayerManager({ player, onParentAdded }: ParentPlayerManagerProps) {
  const [parentEmail, setParentEmail] = useState('');
  const [parentName, setParentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(player.teams?.[0]?.id || null);

  // Fetch the player's team ID if not already available
  useEffect(() => {
    async function fetchPlayerTeam() {
      if (!teamId && player.id) {
        try {
          // Get the team ID from the team_members table
          const { data, error } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('id', player.id)
            .single();
            
          if (error) {
            console.error('Error fetching player team:', error);
            return;
          }
          
          if (data && data.team_id) {
            console.log('Found team ID for player:', data.team_id);
            setTeamId(data.team_id);
          }
        } catch (error) {
          console.error('Error in fetchPlayerTeam:', error);
        }
      }
    }
    
    fetchPlayerTeam();
  }, [player.id, teamId]);

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use the teamId from state, which may have been fetched from the database
      if (!teamId) {
        throw new Error("Cannot add parent: Player is not associated with any team");
      }

      console.log("Adding parent to team:", teamId);
      
      // First create a parent team member
      const { data: parentMember, error: parentError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId, // Use the team ID we've determined
          name: parentName,
          email: parentEmail,
          role: 'parent'
        })
        .select()
        .single();

      if (parentError) throw parentError;

      // Then create the parent-player relationship
      const { error: relationError } = await supabase
        .from('player_parents')
        .insert({
          player_id: player.id,
          parent_id: parentMember.id
        });

      if (relationError) throw relationError;

      toast.success('Parent added successfully');
      setParentEmail('');
      setParentName('');
      onParentAdded();
    } catch (error) {
      console.error('Error adding parent:', error);
      toast.error('Failed to add parent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Parent for {player.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAddParent} className="space-y-4">
          <div>
            <Input
              placeholder="Parent's Name"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Parent's Email"
              value={parentEmail}
              onChange={(e) => setParentEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={loading || !teamId}>
            {loading ? 'Adding...' : !teamId ? 'No Team Found' : 'Add Parent'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
