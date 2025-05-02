
import { useState } from 'react';
import { User, Game } from '@/types';
import { toast } from 'sonner';

export function usePlayerSelection() {
  const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
  const [selectedScorer, setSelectedScorer] = useState<User | null>(null);
  const [primaryAssist, setPrimaryAssist] = useState<User | null>(null);
  const [secondaryAssist, setSecondaryAssist] = useState<User | null>(null);
  const [playersOnIce, setPlayersOnIce] = useState<User[]>([]);
  const [opponentJerseyNumbers, setOpponentJerseyNumbers] = useState<{
    scorer: string;
    primaryAssist: string;
    secondaryAssist: string;
  }>({
    scorer: '',
    primaryAssist: '',
    secondaryAssist: ''
  });
  const [isOpponentTeam, setIsOpponentTeam] = useState<boolean>(false);

  const handleTeamSelect = (team: 'home' | 'away') => {
    setSelectedTeam(team);
    setIsOpponentTeam(team === 'away');
    // Reset all selections when team changes
    setSelectedScorer(null);
    setPrimaryAssist(null);
    setSecondaryAssist(null);
    setPlayersOnIce([]);
    setOpponentJerseyNumbers({
      scorer: '',
      primaryAssist: '',
      secondaryAssist: ''
    });
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
    
    // For opponent team, we don't require full validation
    if (isOpponentTeam) {
      return true;
    }
    
    // For home team, maintain current validation rules
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

  // New methods for opponent jersey numbers
  const handleOpponentJerseyNumber = (type: 'scorer' | 'primaryAssist' | 'secondaryAssist', number: string) => {
    setOpponentJerseyNumbers(prev => ({
      ...prev,
      [type]: number
    }));
  };

  return {
    selectedTeam,
    selectedScorer,
    primaryAssist,
    secondaryAssist,
    playersOnIce,
    isOpponentTeam,
    opponentJerseyNumbers,
    setSelectedTeam,
    handleTeamSelect,
    handleScorerSelect,
    handlePrimaryAssistSelect,
    handleSecondaryAssistSelect,
    handlePlayersOnIceSelect,
    handleOpponentJerseyNumber,
    validatePlayers
  };
}
