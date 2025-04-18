
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lines, Position } from "@/types";
import { ForwardsTab } from "../tabs/ForwardsTab";
import { DefenseTab } from "../tabs/DefenseTab";
import { GoaliesTab } from "../tabs/GoaliesTab";

interface LineupTabsProps {
  lines: Lines;
  currentTab: 'forwards' | 'defense' | 'goalies';
  onTabChange: (tab: 'forwards' | 'defense' | 'goalies') => void;
  handlePositionSelect: (lineIndex: number, position: Position) => void;
  deleteForwardLine: (lineIndex: number) => void;
  deleteDefenseLine: (lineIndex: number) => void;
  addForwardLine: () => void;
  addDefenseLine: () => void;
}

export function LineupTabs({
  lines,
  currentTab,
  onTabChange,
  handlePositionSelect,
  deleteForwardLine,
  deleteDefenseLine,
  addForwardLine,
  addDefenseLine
}: LineupTabsProps) {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-3 mb-6">
        <TabsTrigger value="forwards">Forwards</TabsTrigger>
        <TabsTrigger value="defense">Defense</TabsTrigger>
        <TabsTrigger value="goalies">Goalies</TabsTrigger>
      </TabsList>
      
      <TabsContent value="forwards">
        <ForwardsTab 
          lines={lines}
          handlePositionSelect={handlePositionSelect}
          deleteForwardLine={deleteForwardLine}
          addForwardLine={addForwardLine}
        />
      </TabsContent>
      
      <TabsContent value="defense">
        <DefenseTab 
          lines={lines}
          handlePositionSelect={handlePositionSelect}
          deleteDefenseLine={deleteDefenseLine}
          addDefenseLine={addDefenseLine}
        />
      </TabsContent>
      
      <TabsContent value="goalies">
        <GoaliesTab 
          lines={lines}
          handlePositionSelect={handlePositionSelect}
        />
      </TabsContent>
    </Tabs>
  );
}
