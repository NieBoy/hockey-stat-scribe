
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface CoachAddFormProps {
  teamId: string;
  onCoachAdded: () => void;
}

export default function CoachAddForm({ teamId, onCoachAdded }: CoachAddFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Coach name is required");
      return;
    }
    
    setLoading(true);
    try {
      // Add coach directly to team_members table
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          name,
          email: email || null,
          role: 'coach'
        })
        .select();
        
      if (error) throw error;
      
      toast.success(`${name} added as coach`);
      setName('');
      setEmail('');
      onCoachAdded();
    } catch (error) {
      console.error('Error adding coach:', error);
      toast.error('Failed to add coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Coach</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Coach Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Coach Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Coach'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
