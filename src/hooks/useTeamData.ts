import { useState, useEffect, useCallback } from "react";
import { useTeams } from "@/hooks/useTeams";
import { toast } from "sonner";
import { User } from "@/types";
import { sendTeamInvitations } from "@/services/teams";

export function useTeamData(teamId: string) {
  const [activeTab, setActiveTab] = useState("players");
  const [lineupRefreshKey, setLineupRefreshKey] = useState<number>(0);
  
  const { 
    addPlayerDialogOpen, 
    setAddPlayerDialogOpen, 
    newPlayer,
    setNewPlayer,
    handleAddPlayer,
    submitNewPlayer,
    selectedTeam,
    handleRemovePlayer,
    team,
    isLoadingTeam,
    teamError,
    refetchTeam
  } = useTeams(teamId);

  useEffect(() => {
    console.log("TeamDetail - Initial refresh of team data");
    refetchTeam();

    const intervalId = setInterval(() => {
      console.log("TeamDetail - Periodic team data refresh");
      refetchTeam();
      setLineupRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(intervalId);
  }, [refetchTeam]);

  useEffect(() => {
    const handleFocus = () => {
      console.log("TeamDetail - Window focused - refreshing team data");
      refetchTeam();
      setLineupRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchTeam]);

  useEffect(() => {
    console.log("TeamDetail - Component mounted, forcing immediate lineup refresh");
    setLineupRefreshKey(Date.now());
  }, []);

  const handleSendInvitations = async (memberIds: string[]) => {
    if (!teamId || memberIds.length === 0) {
      toast.error("No members selected for invitation", { 
        duration: 5000 // 5 seconds
      });
      return;
    }
    
    try {
      console.log(`TeamDetail - Sending invitations to ${memberIds.length} members`);
      toast.loading("Sending invitations...", { id: "send-invitations" });
      
      const success = await sendTeamInvitations(teamId, memberIds);
      
      if (success) {
        toast.success(`Invitations sent successfully`, {
          id: "send-invitations",
          duration: 5000 // 5 seconds
        });
      } else {
        toast.error("No invitations were sent", {
          id: "send-invitations",
          description: "Please check that members have email addresses.",
          duration: 8000 // 8 seconds
        });
      }
    } catch (error: any) {
      console.error("Error sending invitations:", error);
      toast.dismiss("send-invitations");
      toast.error("Error sending invitations", {
        id: "send-invitations-error",
        description: error.message || "An unexpected error occurred.",
        duration: 10000, // 10 seconds
      });
    }
  };

  const handleRemoveMember = async (member: User) => {
    if (!member?.id) {
      toast.error("Invalid member selected", { 
        duration: 5000 
      });
      return;
    }
    
    try {
      console.log(`TeamDetail - Removing team member: ${member.name} (${member.id})`);
      const success = await deleteTeamMember(member.id);
      
      if (success) {
        toast.success(`${member.name} has been removed from the team`, {
          duration: 5000
        });
        refetchTeam();
      } else {
        toast.error("Failed to remove team member", {
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Error removing team member", {
        duration: 5000
      });
    }
  };

  const handleTeamUpdate = () => {
    console.log("Team update detected, refreshing data");
    refetchTeam();
    setLineupRefreshKey(prev => prev + 1);
  };

  const handleRefreshLineup = () => {
    console.log("TeamDetail - Manual lineup refresh requested");
    refetchTeam();
    setLineupRefreshKey(Date.now());
    toast.success("Refreshing lineup data...");
  };

  return {
    activeTab,
    setActiveTab,
    lineupRefreshKey,
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    newPlayer,
    setNewPlayer,
    handleAddPlayer,
    submitNewPlayer,
    selectedTeam,
    handleRemovePlayer,
    team,
    isLoadingTeam,
    teamError,
    refetchTeam,
    handleSendInvitations,
    handleRemoveMember,
    handleTeamUpdate,
    handleRefreshLineup
  };
}
