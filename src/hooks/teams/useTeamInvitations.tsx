
import { useState } from "react";
import { toast } from "sonner";
import { sendTeamInvitations, deleteTeamMember } from "@/services/teams";
import { ensureInvitationsTableExists } from "@/services/teams/invitations/dbSetup";
import { User } from "@/types";

export function useTeamInvitations(teamId: string, refetchTeam?: () => void) {
  const [isSendingInvitations, setIsSendingInvitations] = useState(false);
  const [lastInvitationSent, setLastInvitationSent] = useState<Date | null>(null);
  // Track the last set of invitation links
  const [invitationLinks, setInvitationLinks] = useState<string[]>([]);

  const handleSendInvitations = async (memberIds: string[]) => {
    if (!teamId || memberIds.length === 0) {
      toast.error("No members selected for invitation", { duration: 5000 });
      return;
    }

    try {
      setIsSendingInvitations(true);
      toast.loading("Sending invitations...", { id: "send-invitations" });

      await ensureInvitationsTableExists();
      const { sent, signupLinks } = await sendTeamInvitations(teamId, memberIds);
      
      console.log("Invitation response:", { sent, signupLinks });

      // Always update the invitation links, even if the server says none were sent
      // This helps with debugging and ensures UI state is consistent
      setLastInvitationSent(new Date());
      setInvitationLinks(signupLinks || []);

      if (signupLinks && signupLinks.length > 0) {
        // Show success message without links in toast description
        toast.success("Invitation links ready!", {
          id: "send-invitations",
          description: "Invitation links have been generated and are displayed below.",
          duration: 8000,
        });
      } else {
        toast.error("No invitations were created", {
          id: "send-invitations",
          description: "Please check that members have email addresses.",
          duration: 8000,
        });
      }
    } catch (error: any) {
      console.error("Error sending invitations:", error);
      toast.dismiss("send-invitations");
      toast.error("Error sending invitations", {
        id: "send-invitations-error",
        description: error.message || "An unexpected error occurred.",
        duration: 10000,
      });
    } finally {
      setIsSendingInvitations(false);
    }
  };

  const handleRemoveMember = async (member: User) => {
    if (!member?.id) {
      toast.error("Invalid member selected", { duration: 5000 });
      return;
    }
    try {
      console.log(`TeamDetail - Removing team member: ${member.name} (${member.id})`);
      const success = await deleteTeamMember(member.id);

      if (success) {
        toast.success(`${member.name} has been removed from the team`, { duration: 5000 });
        if (refetchTeam) refetchTeam();
      } else {
        toast.error("Failed to remove team member", { duration: 5000 });
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Error removing team member", { duration: 5000 });
    }
  };

  return {
    isSendingInvitations,
    lastInvitationSent,
    invitationLinks,
    handleSendInvitations,
    handleRemoveMember,
  };
}
