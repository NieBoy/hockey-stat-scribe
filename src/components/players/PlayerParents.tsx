
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { User } from "@/types";
import { useState } from "react";
import ParentPlayerManager from "@/components/teams/ParentPlayerManager";

interface PlayerParentsProps {
  player: User;
}

export default function PlayerParents({ player }: PlayerParentsProps) {
  const [showAddParent, setShowAddParent] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Parents</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setShowAddParent(!showAddParent)}
        >
          <UserPlus className="h-3 w-3" /> 
          {showAddParent ? 'Hide' : 'Add Parent'}
        </Button>
      </div>
      
      {showAddParent && (
        <div className="mb-4">
          <ParentPlayerManager 
            player={player} 
            onParentAdded={() => setShowAddParent(false)}
          />
        </div>
      )}
    </>
  );
}
