
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { MembersTableContent } from '../teams/members/MembersTableContent';
import EditMemberDialog from './EditMemberDialog';
import { toast } from 'sonner';
import { updateTeamMemberInfo } from '@/services/teams/memberUpdateService';

interface PlayersListProps {
  players: User[];
  isParent?: boolean;
  isCoach?: boolean;
}

export default function PlayersList({ players, isParent, isCoach }: PlayersListProps) {
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  
  const handleEdit = (member: User) => {
    setMemberToEdit(member);
  };

  const handleDelete = (member: User) => {
    toast.error("Delete functionality not implemented");
  };

  const handleEditSubmit = async (updatedData: {
    name?: string;
    email?: string;
    position?: string;
    number?: string;
  }) => {
    if (!memberToEdit?.id) return;
    
    try {
      // Get the team ID from the member's teams array
      const teamId = memberToEdit.teams?.[0]?.id;
      if (!teamId) {
        throw new Error("No team found for this member");
      }

      await updateTeamMemberInfo(teamId, memberToEdit.id, updatedData);
      
      toast.success("Profile updated successfully");
      setMemberToEdit(null);
      // Reload the page to see updates
      window.location.reload();
    } catch (error: any) {
      console.error("Error updating member:", error);
      toast.error("Failed to update profile", {
        description: error.message,
        duration: 5000
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Players</CardTitle>
        <CardDescription>
          View and manage players{isCoach ? " in your teams" : isParent ? " you are responsible for" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MembersTableContent
          members={players}
          selectedMembers={selectedMemberIds}
          onSelectMember={(id) => setSelectedMemberIds(prev => 
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
          )}
          onSelectAll={(checked) => setSelectedMemberIds(checked ? players.map(p => p.id) : [])}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </CardContent>

      <EditMemberDialog 
        member={memberToEdit}
        onClose={() => setMemberToEdit(null)}
        onSubmit={handleEditSubmit}
      />
    </Card>
  );
}
