
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addRoleToUser, removeRoleFromUser } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/types';

export default function RoleManager() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  if (!user) return null;
  
  const hasAdminRole = user.role.includes('admin');
  
  const handleToggleAdmin = async () => {
    if (!user.id) return;
    
    setIsLoading(true);
    try {
      let result;
      
      if (hasAdminRole) {
        // Remove admin role (only if they have other roles to avoid leaving user without any role)
        if (user.role.length > 1) {
          result = await removeRoleFromUser(user.id, 'admin');
          if (result.success) {
            toast.success('Admin role removed');
          }
        } else {
          toast.error('Cannot remove role - users must have at least one role');
          return;
        }
      } else {
        // Add admin role
        result = await addRoleToUser(user.id, 'admin');
        if (result.success) {
          toast.success('Admin role added');
        }
      }
      
      if (result?.error) {
        toast.error(result.error);
      } else {
        // Force reload to update user state
        window.location.reload();
      }
    } catch (error) {
      toast.error('Failed to update role');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">User Roles</h3>
          <p className="text-sm text-muted-foreground">Manage your account roles</p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {user.role.map(role => (
          <Badge key={role} variant={role === 'admin' ? 'default' : 'outline'}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        ))}
      </div>
      
      <div>
        <Button 
          onClick={handleToggleAdmin} 
          disabled={isLoading}
          variant={hasAdminRole ? "destructive" : "default"}
        >
          {isLoading ? 'Processing...' : hasAdminRole ? 'Remove Admin Role' : 'Add Admin Role'}
        </Button>
      </div>
    </div>
  );
}
