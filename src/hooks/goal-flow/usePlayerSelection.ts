
import { useState } from 'react';
import { User } from '@/types';
import { toast } from 'sonner';

export function usePlayerSelection() {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedScorer, setSelectedScorer] = useState<User | null>(null);
  const [primaryAssist, setPrimaryAssist] = useState<User | null>(null);
  const [secondaryAssist, setSecondaryAssist] = useState<User | null>(null);
  const [playersOnIce, setPlayersOnIce] = useState<User[]>([]);

  const handleTeamSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    return team;
  };

  const handleScorerSelect = (player: User) => {
    console.log("Selected scorer:", player);
    setSelectedScorer(player);
    return player;
  };

  const handlePrimaryAssistSelect = (player: User | null) => {
    setPrimaryAssist(player);
    return player;
  };

  const handleSecondaryAssistSelect = (player: User | null) => {
    setSecondaryAssist(player);
    return player;
  };

  const handlePlayersOnIceSelect = (players: User[]) => {
    const uniquePlayers = [...new Map(players.map(p => [p.id, p])).values()];
    
    const mandatoryPlayers = [selectedScorer, primaryAssist, secondaryAssist].filter(Boolean) as User[];
    
    const allPlayers = [...uniquePlayers];
    
    mandatoryPlayers.forEach(requiredPlayer => {
      if (requiredPlayer && !allPlayers.some(p => p.id === requiredPlayer.id)) {
        allPlayers.push(requiredPlayer);
      }
    });
    
    const limitedPlayers = allPlayers.slice(0, 6);
    
    setPlayersOnIce(limitedPlayers);
    return limitedPlayers;
  };

  const validatePlayers = (gameId: string | undefined) => {
    if (!gameId) return false;
    
    if (!selectedTeam) {
      toast.error("No team selected");
      return false;
    }
    
    if (!selectedScorer) {
      toast.error("No scorer selected");
      return false;
    }
    
    if (!playersOnIce || playersOnIce.length === 0) {
      toast.error("No players on ice selected");
      return false;
    }
    
    return true;
  };

  return {
    selectedTeam,
    selectedScorer,
    primaryAssist,
    secondaryAssist,
    playersOnIce,
    setSelectedTeam,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
    validatePlayers
  };
}
