
import React, { useState, useEffect, useRef } from 'react';
import { User, Team } from '@/types';
import { MandatoryPlayersStep } from './MandatoryPlayersStep';
import { ExtraPlayersStep } from './ExtraPlayersStep';

interface PlayerSelectionWrapperProps {
  team: Team;
  onPlayersSelect: (players: User[]) => void;
  preSelectedPlayers: User[];
  onComplete: () => void;
  isOpponentTeam?: boolean;
}

type SubStep = "mandatory" | "extras";

export function PlayerSelectionWrapper({
  team,
  onPlayersSelect,
  preSelectedPlayers,
  onComplete,
  isOpponentTeam = false
}: PlayerSelectionWrapperProps) {
  const [subStep, setSubStep] = useState<SubStep>("extras"); // Start with extras for opponent goals
  const [mandatoryPlayers, setMandatoryPlayers] = useState<User[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<User[]>([]);
  
  // Flag tracks first mount/init to avoid bouncing UI
  const initialized = useRef(false);
  const prevIdsRef = useRef<string>('');

  // Only initialize ONCE for given preSelectedPlayers by shallow ID comparison
  useEffect(() => {
    // Convert preSelectedPlayers to IDs for comparison
    const newIdList = preSelectedPlayers.map(player => player.id).join(',');
    
    // Track when preSelectedPlayers actually change
    if (!initialized.current || newIdList !== prevIdsRef.current) {
      const uniqueMandatory = Array.from(
        new Map(preSelectedPlayers.filter(Boolean).map(p => [p.id, p])).values()
      );
      setMandatoryPlayers(uniqueMandatory);
      setSelectedPlayers(uniqueMandatory);
      onPlayersSelect(uniqueMandatory);
      
      // For opponent teams, skip the mandatory step since there are no mandatory players
      setSubStep(isOpponentTeam ? "extras" : "mandatory");
      
      initialized.current = true;
      prevIdsRef.current = newIdList;
    }
  }, [preSelectedPlayers, onPlayersSelect, isOpponentTeam]);

  // Player selection logic for extras (cannot remove mandatory)
  const handleExtraPlayerToggle = (player: User) => {
    const isSelected = selectedPlayers.some(p => p.id === player.id);

    if (!isSelected) {
      setSelectedPlayers([...selectedPlayers, player]);
    } else {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    }
  };

  // Automatically notify parent of changes
  useEffect(() => {
    onPlayersSelect(selectedPlayers);
  }, [selectedPlayers, onPlayersSelect]);

  // Navigation handlers for step structure
  const handleContinueMandatory = () => {
    setSubStep("extras");
  };

  const handleBackToMandatory = () => {
    setSubStep("mandatory");
  };

  // Confirm selection and complete
  const handleConfirm = () => {
    onComplete();
  };

  if (subStep === "mandatory") {
    return (
      <MandatoryPlayersStep 
        mandatoryPlayers={mandatoryPlayers}
        isOpponentTeam={isOpponentTeam}
        onContinue={handleContinueMandatory}
      />
    );
  }

  return (
    <ExtraPlayersStep 
      team={team}
      selectedPlayers={selectedPlayers}
      mandatoryPlayers={mandatoryPlayers}
      isOpponentTeam={isOpponentTeam}
      onPlayerToggle={handleExtraPlayerToggle}
      onBack={handleBackToMandatory}
      onConfirm={handleConfirm}
    />
  );
}
