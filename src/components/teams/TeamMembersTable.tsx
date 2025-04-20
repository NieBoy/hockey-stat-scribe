
import { User, Team } from "@/types";
import { useTeamMembers } from "@/hooks/teams/useTeamMembers";
import { TableHeader } from "./members/TableHeader";
import { MembersTableContent } from "./members/MembersTableContent";
import { DeleteMemberDialog } from "./members/DeleteMemberDialog";
import { toast } from "sonner";

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
  
  const handleSendInvitations = () => {
    if (selectedMembers.length === 0) {
      toast.warning("Please select members to invite");
      return;
    }
    
    if (onSendInvitations) {
      // Check if any selected member has no email
      const selectedMemberObjects = allMembers.filter(m => selectedMembers.includes(m.id));
      const membersWithoutEmail = selectedMemberObjects.filter(m => !m.email);
      
      if (membersWithoutEmail.length > 0) {
        const names = membersWithoutEmail.map(m => m.name).join(", ");
        toast.warning(`Some members don't have email addresses: ${names}`, {
          description: "Please add email addresses before sending invitations."
        });
      }
      
      onSendInvitations(selectedMembers);
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

      <DeleteMemberDialog
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default TeamMembersTable;
