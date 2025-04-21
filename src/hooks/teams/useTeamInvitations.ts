
import { useState } from "react";
import { toast } from "sonner";
import { sendTeamInvitations, deleteTeamMember } from "@/services/teams";
import { ensureInvitationsTableExists } from "@/services/teams/dbFunctions";
import { User } from "@/types";

export function useTeamInvitations(teamId: string, refetchTeam?: () => void) {
  const [isSendingInvitations, setIsSendingInvitations] = useState(false);
  const [lastInvitationSent, setLastInvitationSent] = useState<Date | null>(null);

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

      if (sent && signupLinks.length > 0) {
        setLastInvitationSent(new Date());

        // Show signup links in a nice toast
        toast.success("Invitation(s) ready!", {
          id: "send-invitations",
          description: "Share the link(s) below with your invitees:",
          action: (
            <div className="p-2 space-y-2">
              {signupLinks.map((link, i) => (
                <div key={i} className="flex gap-2 items-center mt-1 mb-1">
                  <a href={link} target="_blank" rel="noopener noreferrer" className="underline text-indigo-700 dark:text-indigo-300 break-all">{link}</a>
                  <button
                    onClick={() => navigator.clipboard.writeText(link)}
                    className="ml-2 px-2 py-0.5 rounded text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          ),
          duration: 24000,
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
    handleSendInvitations,
    handleRemoveMember,
  };
}
