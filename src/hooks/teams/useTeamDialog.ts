
import { useState } from "react";
import { Team, User } from "@/types";

export function useTeamDialog() {
  const [addPlayerDialogOpen, setAddPlayerDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    email: "",
    position: "",
    number: ""
  });

  const handleAddPlayerClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setAddPlayerDialogOpen(true);
  };

  const resetPlayerForm = () => {
    setNewPlayer({ name: "", email: "", position: "", number: "" });
  };

  return {
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    selectedTeamId,
    setSelectedTeamId,
    newPlayer,
    setNewPlayer,
    handleAddPlayerClick,
    resetPlayerForm
  };
}
