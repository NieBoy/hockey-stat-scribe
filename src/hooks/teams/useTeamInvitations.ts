
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

      if (sent && signupLinks.length > 0) {
        setLastInvitationSent(new Date());
        setInvitationLinks(signupLinks);

        // Show signup links in a nice toast
        toast.success("Invitation(s) ready!", {
          id: "send-invitations",
          description: `${signupLinks.length} invitation(s) created successfully`,
          action: {
            label: "View Links",
            onClick: () => {
              // Show a dedicated toast for each link with a copy button
              signupLinks.forEach((link, index) => {
                toast.info(`Invitation link #${index + 1}`, {
                  description: (
                    <div className="break-all text-xs">{link}</div>
                  ),
                  action: {
                    label: "Copy",
                    onClick: () => {
                      navigator.clipboard.writeText(link);
                      toast.success("Link copied to clipboard");
                    }
                  },
                  duration: 30000, // Keep it visible for longer
                });
              });
            }
          },
          duration: 15000, // Show for longer to give user time to click
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
