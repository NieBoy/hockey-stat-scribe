
import { Button } from "@/components/ui/button";
import { Info, UserPlus } from "lucide-react";

interface MissingUserAssociationProps {
  playerName: string;
  onCreateUser: () => void;
  creatingUser: boolean;
}

export default function MissingUserAssociation({ 
  playerName, 
  onCreateUser, 
  creatingUser 
}: MissingUserAssociationProps) {
  return (
    <div className="text-center text-amber-600 p-4 bg-amber-50 border border-amber-200 rounded-md">
      <div className="flex justify-center mb-4">
        <Info className="h-12 w-12" />
      </div>
      <h3 className="font-medium text-lg mb-2">Missing User Association</h3>
      <p>This player exists in the team_members table but doesn't have a user_id.</p>
      
      <div className="mt-4">
        <p>This is a data consistency issue that needs to be fixed:</p>
        <ul className="list-disc list-inside text-left mt-2 text-sm">
          <li>The player needs to be associated with a user in the database</li>
          <li>Stats can only be recorded for players with a valid user_id</li>
          <li>This typically happens when a player is created through the team roster but not linked to a user account</li>
        </ul>
      </div>

      <div className="mt-6 flex justify-center">
        <Button 
          onClick={onCreateUser} 
          className="gap-2" 
          disabled={creatingUser}
        >
          <UserPlus className="h-4 w-4" />
          {creatingUser ? "Creating User..." : "Fix User Association"}
        </Button>
      </div>
      
      <div className="mt-4 text-sm text-amber-700">
        <p>This will create a new user account for "{playerName}" and link it to this player record.</p>
      </div>
    </div>
  );
}
