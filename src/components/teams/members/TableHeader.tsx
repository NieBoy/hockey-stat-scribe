
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TableHeaderProps {
  selectedCount: number;
  onSendInvitations: () => void;
  hasMembersWithoutEmail?: boolean;
}

export const TableHeader = ({ 
  selectedCount, 
  onSendInvitations, 
  hasMembersWithoutEmail = false 
}: TableHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Team Members</h3>
      
      {hasMembersWithoutEmail && selectedCount > 0 ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onSendInvitations}
                variant="default"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                <span>Send Invitations ({selectedCount})</span>
                <AlertCircle className="h-4 w-4 text-yellow-200" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Some selected members don't have email addresses</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Button 
          onClick={onSendInvitations}
          disabled={selectedCount === 0}
          variant={selectedCount > 0 ? "default" : "outline"}
        >
          <Mail className="mr-2 h-4 w-4" />
          {selectedCount > 0 
            ? `Send Invitations (${selectedCount})`
            : "Select Members to Invite"
          }
        </Button>
      )}
    </div>
  );
};
