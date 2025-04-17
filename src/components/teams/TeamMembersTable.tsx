
import { User, Team } from "@/types";
import { useTeamMembers } from "@/hooks/teams/useTeamMembers";
import { TableHeader } from "./members/TableHeader";
import { MembersTableContent } from "./members/MembersTableContent";
import { DeleteMemberDialog } from "./members/DeleteMemberDialog";

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
    if (onSendInvitations) {
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
