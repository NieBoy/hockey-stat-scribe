
import { User, Team } from "@/types";
import { useTeamMembers } from "@/hooks/teams/useTeamMembers";
import { TableHeader } from "./members/TableHeader";
import { MembersTableContent } from "./members/MembersTableContent";
import { DeleteMemberDialog } from "./members/DeleteMemberDialog";
import { toast } from "sonner";
import { useCallback, useMemo } from "react";

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
  const {
    selectedMembers,
    memberToDelete,
    allMembers,
    handleSelectMember,
    handleSelectAll,
    handleDeleteConfirm,
    handleDelete,
    setMemberToDelete
  } = useTeamMembers(team, () => onRemoveMember?.(memberToDelete!));
  
  // Find selected members that have no email
  const selectedMemberObjects = useMemo(() => 
    allMembers.filter(m => selectedMembers.includes(m.id)), 
    [allMembers, selectedMembers]
  );
  
  const hasMembersWithoutEmail = useMemo(() => 
    selectedMemberObjects.some(m => !m.email),
    [selectedMemberObjects]
  );
  
  const handleSendInvitations = useCallback(() => {
    if (selectedMembers.length === 0) {
      toast.warning("Please select members to invite");
      return;
    }
    
    if (onSendInvitations) {
      const membersWithoutEmail = selectedMemberObjects.filter(m => !m.email);
      
      if (membersWithoutEmail.length > 0) {
        const names = membersWithoutEmail.map(m => m.name).join(", ");
        toast.warning(`Some members don't have email addresses: ${names}`, {
          description: "Please add email addresses before sending invitations."
        });
      }
      
      onSendInvitations(selectedMembers);
    }
  }, [selectedMembers, selectedMemberObjects, onSendInvitations]);
  
  return (
    <div className="space-y-4">
      <TableHeader 
        selectedCount={selectedMembers.length}
        onSendInvitations={handleSendInvitations}
        hasMembersWithoutEmail={hasMembersWithoutEmail}
      />
      
      <MembersTableContent 
        members={allMembers}
        selectedMembers={selectedMembers}
        onSelectMember={handleSelectMember}
        onSelectAll={handleSelectAll}
        onEdit={onEditMember}
        onDelete={handleDeleteConfirm}
      />

      <DeleteMemberDialog
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TeamMembersTable;
