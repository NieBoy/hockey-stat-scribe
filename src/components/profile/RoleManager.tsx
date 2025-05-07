
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { addRoleToUser, removeRoleFromUser } from '@/services/auth';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Role } from '@/types';

export default function RoleManager() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  
  if (!user) return null;
  
  const availableRoles: Role[] = ['admin', 'coach', 'player', 'parent'];
  
  const handleToggleRole = async (role: Role) => {
    if (!user.id) return;
    
    setIsLoading(prev => ({ ...prev, [role]: true }));
    try {
      let result;
      
      if (Array.isArray(user.role) && user.role.includes(role)) {
        // Remove role (only if they have other roles to avoid leaving user without any role)
        if (user.role.length > 1) {
          result = await removeRoleFromUser(user.id, role);
          if (result.success) {
            toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} role removed`);
          }
        } else {
          toast.error('Cannot remove role - users must have at least one role');
          return;
        }
      } else {
        // Add role
        result = await addRoleToUser(user.id, role);
        if (result.success) {
          toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} role added`);
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
      setIsLoading(prev => ({ ...prev, [role]: false }));
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Roles</CardTitle>
        <CardDescription>Manage your account roles and permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(user.role) ? user.role.map(role => (
            <Badge key={role} variant="default">
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </Badge>
          )) : (
            <Badge variant="default">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Badge>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {availableRoles.map(role => (
            <Button 
              key={role}
              onClick={() => handleToggleRole(role)} 
              disabled={isLoading[role]}
              variant={Array.isArray(user.role) && user.role.includes(role) ? "destructive" : "outline"}
              className="flex justify-between items-center"
            >
              <span>{isLoading[role] ? 'Processing...' : (Array.isArray(user.role) && user.role.includes(role)) ? `Remove ${role} Role` : `Add ${role} Role`}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
