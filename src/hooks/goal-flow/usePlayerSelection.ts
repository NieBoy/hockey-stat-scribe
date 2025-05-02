
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
    console.log("Selected players on ice:", players);
    
    const uniquePlayers = [...new Map(players.map(p => [p.id, p])).values()];
    
    // Only add mandatory players if it's not an opponent team goal
    if (!isOpponentTeam) {
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
    } else {
      // For opponent team goals, just use the selected players (up to 6)
      const limitedPlayers = uniquePlayers.slice(0, 6);
      setPlayersOnIce(limitedPlayers);
      return limitedPlayers;
    }
  };

  const validatePlayers = (gameId: string | undefined) => {
    if (!gameId) return false;
    
    if (!selectedTeam) {
      toast.error("No team selected");
      return false;
    }
    
    // For opponent team goals, validation is simplified
    if (isOpponentTeam) {
      // For opponent goals, we don't require the jersey number anymore
      // But we still need players on ice for plus/minus (for home team)
      if (!playersOnIce || playersOnIce.length === 0) {
        toast.error("Please select at least one player on ice");
        return false;
      }
      
      // If no jersey number is provided, we'll use a placeholder
      if (!opponentJerseyNumbers.scorer) {
        console.log("No opponent jersey number, using placeholder");
        setOpponentJerseyNumbers(prev => ({
          ...prev,
          scorer: 'Unknown'
        }));
      }
      
      return true;
    }
    
    // For home team goals, maintain current validation rules
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

  // Methods for opponent jersey numbers
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
