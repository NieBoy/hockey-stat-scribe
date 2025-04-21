
import { User, Team } from "@/types";
import { useTeamMembers } from "@/hooks/teams/useTeamMembers";
import { TableHeader } from "./members/TableHeader";
import { MembersTableContent } from "./members/MembersTableContent";
import { DeleteMemberDialog } from "./members/DeleteMemberDialog";
import { toast } from "sonner";
import { useCallback, useMemo, useState } from "react";

interface TeamMembersTableProps {
  team: Team;
  onSendInvitations?: (memberIds: string[]) => void;
  onEditMember?: (member: User) => void;
  onRemoveMember?: (member: User) => void;
  isSendingInvitations?: boolean;
  lastInvitationSent?: Date | null;
}

const TeamMembersTable = ({ 
  team,
  onSendInvitations,
  onEditMember,
  onRemoveMember,
  isSendingInvitations = false,
  lastInvitationSent = null
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
  
  // Track last invitation time locally too as a backup
  const [localLastSent, setLocalLastSent] = useState<Date | null>(lastInvitationSent);
  
  const handleSendInvitations = useCallback(() => {
    if (selectedMembers.length === 0) {
      toast.warning("Please select members to invite", {
        duration: 8000
      });
      return;
    }
    
    if (onSendInvitations) {
      const membersWithoutEmail = selectedMemberObjects.filter(m => !m.email);
      
      if (membersWithoutEmail.length > 0) {
        const names = membersWithoutEmail.map(m => m.name).join(", ");
        toast.warning(`Some members don't have email addresses: ${names}`, {
          description: "Please add email addresses before sending invitations.",
          duration: 10000
        });
        
        // If all selected members are missing emails, don't proceed
        if (membersWithoutEmail.length === selectedMembers.length) {
          return;
        }
      }
      
      setLocalLastSent(new Date());
      onSendInvitations(selectedMembers);
    }
  }, [selectedMembers, selectedMemberObjects, onSendInvitations]);
  
  // Use the prop value if provided, otherwise use local state
  const effectiveLastSent = lastInvitationSent || localLastSent;
  
  return (
    <div className="space-y-4">
      <TableHeader 
        selectedCount={selectedMembers.length}
        onSendInvitations={handleSendInvitations}
        hasMembersWithoutEmail={hasMembersWithoutEmail}
        isLoading={isSendingInvitations}
        lastSent={effectiveLastSent}
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
      
      {effectiveLastSent && (
        <div className="text-sm text-muted-foreground">
          Last invitation attempt: {effectiveLastSent.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default TeamMembersTable;
