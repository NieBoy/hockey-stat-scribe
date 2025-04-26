
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Team, Lines, Position, User } from '@/types';
import { AvailablePlayersSection } from './AvailablePlayersSection';
import { EvenStrengthLines } from './EvenStrengthLines';
import { SpecialTeamsUnit } from './SpecialTeamsUnit';

interface RosterContainerProps {
  team: Team;
  lines: Lines;
  availablePlayers: any[];
  handlePlayerMove: (playerId: string, targetLineType: 'forwards' | 'defense' | 'goalies', targetLineIndex: number, targetPosition: Position) => void;
  addForwardLine: () => void;
  addDefenseLine: () => void;
  onPositionClick?: (lineType: 'forwards' | 'defense' | 'goalies', lineIndex: number, position: Position, player: User | null) => void;
}

export function RosterContainer({ 
  team, 
  lines, 
  availablePlayers,
  handlePlayerMove,
  addForwardLine,
  addDefenseLine,
  onPositionClick
}: RosterContainerProps) {
  return (
    <div className="space-y-6">
      <AvailablePlayersSection availablePlayers={availablePlayers} />

      <Tabs defaultValue="even-strength" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="even-strength">Even Strength</TabsTrigger>
          <TabsTrigger value="power-play">Power Play</TabsTrigger>
          <TabsTrigger value="penalty-kill">Penalty Kill</TabsTrigger>
        </TabsList>
        
        <TabsContent value="even-strength">
          <EvenStrengthLines 
            lines={lines}
            onAddForwardLine={addForwardLine}
            onAddDefenseLine={addDefenseLine}
            onPositionClick={onPositionClick}
          />
        </TabsContent>
        
        <TabsContent value="power-play">
          <SpecialTeamsUnit
            title="Power Play Units"
            units={[1, 2]}
            positions={['LW', 'C', 'RW', 'LD', 'RD']}
            type="pp"
            players={lines.specialTeams?.powerPlay}
            onPositionClick={onPositionClick ? 
              (lineIndex, position, player) => onPositionClick('forwards', lineIndex, position as Position, player) : 
              undefined}
          />
        </TabsContent>
        
        <TabsContent value="penalty-kill">
          <SpecialTeamsUnit
            title="Penalty Kill Units"
            units={[1, 2]}
            positions={['LF', 'RF', 'LD', 'RD']}
            type="pk"
            players={lines.specialTeams?.penaltyKill}
            onPositionClick={onPositionClick ? 
              (lineIndex, position, player) => onPositionClick('forwards', lineIndex, position as Position, player) : 
              undefined}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
