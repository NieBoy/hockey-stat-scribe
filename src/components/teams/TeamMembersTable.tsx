
import { User, Team } from "@/types";
import { useTeamMembers } from "@/hooks/teams/useTeamMembers";
import { TableHeader } from "./members/TableHeader";
import { MembersTableContent } from "./members/MembersTableContent";
import { DeleteMemberDialog } from "./members/DeleteMemberDialog";
import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Copy, Link2 } from "lucide-react";

interface TeamMembersTableProps {
  team: Team;
  onSendInvitations?: (memberIds: string[]) => void;
  onEditMember?: (member: User) => void;
  onRemoveMember?: (member: User) => void;
  isSendingInvitations?: boolean;
  lastInvitationSent?: Date | null;
  invitationLinks?: string[];
}

const TeamMembersTable = ({ 
  team,
  onSendInvitations,
  onEditMember,
  onRemoveMember,
  isSendingInvitations = false,
  lastInvitationSent = null,
  invitationLinks = []
}: TeamMembersTableProps) => {
  // Initialize useTeamMembers with the correct callback
  const teamMembers = useTeamMembers(team, onRemoveMember);
  
  // Get values from teamMembers return
  const { 
    players, 
    coaches, 
    parents, 
    selectedMembers = [], 
    allMembers = [],
    memberToDelete,
    handleSelectMember,
    handleSelectAll,
    handleDeleteConfirm,
    handleDelete,
    setMemberToDelete 
  } = teamMembers;
  
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
  
  // Store the last generated links locally to show in the UI
  const [lastLinks, setLastLinks] = useState<string[]>([]);

  // Update local state when props change
  useEffect(() => {
    if (lastInvitationSent) {
      setLocalLastSent(lastInvitationSent);
    }
    
    // Always update links when they change
    if (invitationLinks && invitationLinks.length > 0) {
      console.log("Updating invitation links in TeamMembersTable:", invitationLinks);
      setLastLinks(invitationLinks);
    }
  }, [lastInvitationSent, invitationLinks]);
  
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
  
  // Calculate which links to display
  const linksToDisplay = invitationLinks?.length ? invitationLinks : lastLinks;

  // Function to display links in the UI for manual copying
  const showInvitationLinks = () => {
    if (!linksToDisplay || linksToDisplay.length === 0) return null;
    
    return (
      <div className="mt-4 p-4 border rounded-md bg-muted/20">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <Link2 className="h-4 w-4" /> 
          Invitation Links
        </h3>
        <div className="space-y-2">
          {linksToDisplay.map((link, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <div className="truncate flex-1 bg-background p-2 rounded border text-xs">
                {link}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(link);
                  toast.success("Link copied to clipboard");
                }}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
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

      {/* Always show invitation links if available */}
      {showInvitationLinks()}

      {/* Instruction for users */}
      {!linksToDisplay?.length && (
        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            Select team members and click "Send Invitations" to generate invitation links.
            The invitation links will appear here after sending.
          </p>
        </div>
      )}
    </div>
  );
}

export default TeamMembersTable;
