
import { useState } from "react";
import { User, Team } from "@/types";
import { deleteTeamMember } from "@/services/teams";
import { toast } from "sonner";

export const useTeamMembers = (team: Team, onTeamUpdate?: () => void) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [allMembers, setAllMembers] = useState([
    ...(team.players || []),
    ...(team.coaches || []),
    ...(team.parents || [])
  ]);

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allMemberIds = allMembers.map(m => m.id);
      setSelectedMembers(allMemberIds);
    } else {
      setSelectedMembers([]);
    }
  };

  const handleDeleteConfirm = (member: User) => {
    setMemberToDelete(member);
  };

  const handleDelete = async () => {
    if (memberToDelete) {
      // Optimistically remove the member from the local state
      setAllMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      
      // Clear selected member if they were selected
      setSelectedMembers(prev => prev.filter(id => id !== memberToDelete.id));
      
      try {
        const success = await deleteTeamMember(memberToDelete.id);
        if (success) {
          toast.success(`${memberToDelete.name} has been removed from the team`);
          if (onTeamUpdate) {
            onTeamUpdate();
          }
        }
      } catch (error) {
        console.error("Error removing member:", error);
        toast.error("Failed to remove member");
      }
      
      // Clear the deletion state
      setMemberToDelete(null);
    }
  };

  return {
    selectedMembers,
    memberToDelete,
    allMembers,
    handleSelectMember,
    handleSelectAll,
    handleDeleteConfirm,
    handleDelete,
    setMemberToDelete
  };
};
