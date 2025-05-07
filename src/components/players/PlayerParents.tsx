
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { User, Role } from "@/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface PlayerParentsProps {
  playerId: string;
}

export default function PlayerParents({ playerId }: PlayerParentsProps) {
  const [parents, setParents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchParents = async () => {
      setIsLoading(true);
      
      try {
        // Fetch the player's parents
        const { data, error } = await supabase
          .from('player_parents')
          .select(`
            parent_id,
            parent:parent_id (
              id,
              name,
              email
            )
          `)
          .eq('player_id', playerId);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Get parent user IDs
          const parentIds = data.map(item => item.parent_id);
          
          // Fetch parent user roles
          const { data: rolesData, error: rolesError } = await supabase
            .from('user_roles')
            .select('user_id, role')
            .in('user_id', parentIds)
            .eq('role', 'parent');
            
          if (rolesError) throw rolesError;
          
          // Map data to parent objects
          const parentsList: User[] = data.map(item => {
            // Find parent role
            const parentRole = rolesData?.find(role => role.user_id === item.parent_id)?.role || 'parent';
            
            // Create a properly typed User object
            const parent: User = {
              id: item.parent.id,
              name: item.parent.name,
              email: item.parent.email,
              role: parentRole as Role,
              avatar_url: null
            };
            
            return parent;
          });
          
          setParents(parentsList);
        }
      } catch (error) {
        console.error('Error fetching parents:', error);
        toast.error('Failed to load parents');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (playerId) {
      fetchParents();
    }
  }, [playerId]);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Parents</CardTitle>
        <Button variant="outline" size="sm">
          <UserPlus className="h-4 w-4 mr-2" />
          Add Parent
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading parents...</div>
        ) : parents.length > 0 ? (
          <div className="space-y-4">
            {parents.map((parent) => (
              <div key={parent.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{parent.name}</div>
                  <div className="text-sm text-muted-foreground">{parent.email}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            No parents associated with this player.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
