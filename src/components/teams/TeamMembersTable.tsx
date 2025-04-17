
import { useState } from "react";
import { User, Team } from "@/types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TableHeader } from "./members/TableHeader";
import { MembersTableContent } from "./members/MembersTableContent";

interface TeamMembersTableProps {
  team: Team;
  onSendInvitations?: (memberIds: string[]) => void;
  onEditMember?: (member: User) => void;
  onRemoveMember?: (member: User) => void;
}

const TeamMembersTable = ({ 
  team,
  onSendInvitations,
  onEditMember,
  onRemoveMember
}: TeamMembersTableProps) => {
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

  const handleSendInvitations = () => {
    if (selectedMembers.length === 0) {
      toast.error("No members selected");
      return;
    }
    
    if (onSendInvitations) {
      onSendInvitations(selectedMembers);
    }
  };

  const handleDeleteConfirm = (member: User) => {
    setMemberToDelete(member);
  };
  
  const handleDelete = async () => {
    if (memberToDelete && onRemoveMember) {
      // Optimistically remove the member from the local state
      setAllMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      
      // Call the parent handler
      await onRemoveMember(memberToDelete);
      
      // Clear selected member if they were selected
      setSelectedMembers(prev => prev.filter(id => id !== memberToDelete.id));
      
      // Clear the deletion state
      setMemberToDelete(null);
      
      // Show success message
      toast.success(`${memberToDelete.name} has been removed from the team`);
    }
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allMemberIds = allMembers.map(m => m.id);
      setSelectedMembers(allMemberIds);
    } else {
      setSelectedMembers([]);
    }
  };
  
  return (
    <div className="space-y-4">
      <TableHeader 
        selectedCount={selectedMembers.length}
        onSendInvitations={handleSendInvitations}
      />
      
      <MembersTableContent 
        members={allMembers}
        selectedMembers={selectedMembers}
        onSelectMember={handleSelectMember}
        onSelectAll={handleSelectAll}
        onEdit={onEditMember}
        onDelete={handleDeleteConfirm}
      />

      <AlertDialog 
        open={!!memberToDelete} 
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {memberToDelete?.name} from the team.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMemberToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeamMembersTable;
