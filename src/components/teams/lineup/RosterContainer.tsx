
import { DragDropContext } from '@hello-pangea/dnd';
import { Team, Lines } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDragAndDrop } from '@/hooks/lineup/useDragAndDrop';
import { AvailablePlayersSection } from './AvailablePlayersSection';
import { EvenStrengthLines } from './EvenStrengthLines';
import { SpecialTeamsUnit } from './SpecialTeamsUnit';

interface RosterContainerProps {
  team: Team;
  lines: Lines;
  availablePlayers: any[];
  handlePlayerMove: any;
  addForwardLine: () => void;
  addDefenseLine: () => void;
}

export function RosterContainer({ 
  team, 
  lines, 
  availablePlayers,
  handlePlayerMove,
  addForwardLine,
  addDefenseLine
}: RosterContainerProps) {
  const { onDragEnd } = useDragAndDrop({ lines, availablePlayers, handlePlayerMove });

  return (
    <DragDropContext onDragEnd={(result) => {
      onDragEnd(result);
      // Removed the success toast and auto-save trigger
    }}>
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
            />
          </TabsContent>
          
          <TabsContent value="power-play">
            <SpecialTeamsUnit
              title="Power Play Units"
              units={[1, 2]}
              positions={['LW', 'C', 'RW', 'LD', 'RD']}
              type="pp"
              players={lines.specialTeams?.powerPlay}
            />
          </TabsContent>
          
          <TabsContent value="penalty-kill">
            <SpecialTeamsUnit
              title="Penalty Kill Units"
              units={[1, 2]}
              positions={['LF', 'RF', 'LD', 'RD']}
              type="pk"
              players={lines.specialTeams?.penaltyKill}
            />
          </TabsContent>
        </Tabs>
      </div>
    </DragDropContext>
  );
}
