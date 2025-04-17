
import { Button } from "@/components/ui/button";
import { UserPlus, Trash2 } from "lucide-react";
import { User } from "@/types";
import { useState, useEffect, useCallback } from "react";
import ParentPlayerManager from "@/components/teams/ParentPlayerManager";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { getUserInitials } from "@/utils/nameUtils";
import { Link } from "react-router-dom";
import { deleteTeamMember } from "@/services/teams";
import { toast } from "sonner";

interface PlayerParentsProps {
  player: User;
}

export default function PlayerParents({ player }: PlayerParentsProps) {
  const [showAddParent, setShowAddParent] = useState(false);
  const [parents, setParents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadParents = useCallback(async () => {
    if (!player.id) return;
    
    setLoading(true);
    try {
      // Get parent-player relationships
      const { data: relationships, error: relError } = await supabase
        .from('player_parents')
        .select('parent_id')
        .eq('player_id', player.id);
        
      if (relError) throw relError;
      
      if (relationships && relationships.length > 0) {
        const parentIds = relationships.map(rel => rel.parent_id);
        
        // Get parent details
        const { data: parentData, error: parentError } = await supabase
          .from('team_members')
          .select('id, name, email, role')
          .in('id', parentIds)
          .eq('role', 'parent');
          
        if (parentError) throw parentError;
        
        const parentUsers = (parentData || []).map(parent => ({
          id: parent.id,
          name: parent.name || 'Unknown Parent',
          email: parent.email,
          role: ['parent'] as ['parent'],
          children: [{ // Add the current player as a child
            id: player.id,
            name: player.name,
            role: ['player'] as ['player']
          }]
        }));
        
        setParents(parentUsers);
      } else {
        setParents([]);
      }
    } catch (error) {
      console.error('Error loading parents:', error);
    } finally {
      setLoading(false);
    }
  }, [player.id]);

  useEffect(() => {
    loadParents();
  }, [loadParents]);

  const handleParentAdded = () => {
    setShowAddParent(false);
    loadParents();
  };
  
  const handleRemoveParent = async (parent: User) => {
    try {
      // First delete the parent-player relationship
      const { error: relationError } = await supabase
        .from('player_parents')
        .delete()
        .eq('parent_id', parent.id)
        .eq('player_id', player.id);
      
      if (relationError) {
        console.error("Error removing parent-player relationship:", relationError);
        throw relationError;
      }
      
      // Then delete the team member
      const success = await deleteTeamMember(parent.id);
      if (success) {
        toast.success(`${parent.name} has been removed as a parent`);
        loadParents();
      }
    } catch (error) {
      console.error("Error removing parent:", error);
      toast.error("Failed to remove parent");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Parents</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setShowAddParent(!showAddParent)}
        >
          <UserPlus className="h-3 w-3" /> 
          {showAddParent ? 'Hide' : 'Add Parent'}
        </Button>
      </div>
      
      {showAddParent && (
        <div className="mb-4">
          <ParentPlayerManager 
            player={player} 
            onParentAdded={handleParentAdded}
          />
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
        </div>
      ) : parents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parents.map(parent => (
            <Card key={parent.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials(parent.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-center">
                      <Link 
                        to={`/players/${parent.id}`}
                        className="text-lg font-medium hover:underline"
                      >
                        {parent.name}
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleRemoveParent(parent)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">Parent</div>
                    {parent.email && (
                      <div className="text-sm text-muted-foreground">{parent.email}</div>
                    )}
                    <div className="text-sm">
                      Parent of: {player.name}
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-4">
          No parents associated with this player yet.
        </p>
      )}
    </>
  );
}
