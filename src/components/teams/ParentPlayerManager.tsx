
import React, { useState } from 'react';
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

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get the team ID from the player's teams array
      const teamId = player.teams?.[0]?.id;
      
      if (!teamId) {
        throw new Error("Cannot add parent: Player is not associated with any team");
      }

      console.log("Adding parent to team:", teamId);
      
      // First create a parent team member
      const { data: parentMember, error: parentError } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId, // Use the team ID from player's first team
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
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Parent'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
