
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TableHeaderProps {
  selectedCount: number;
  onSendInvitations: () => void;
  hasMembersWithoutEmail?: boolean;
  isLoading?: boolean;
  lastSent?: Date | null;
}

export const TableHeader = ({ 
  selectedCount, 
  onSendInvitations, 
  hasMembersWithoutEmail = false,
  isLoading = false,
  lastSent = null
}: TableHeaderProps) => {
  // Calculate if invitations were sent recently (within last 5 seconds)
  const justSent = lastSent && (Date.now() - lastSent.getTime() < 5000);
  
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
                disabled={isLoading || justSent}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : justSent ? (
                  <CheckCircle2 className="h-4 w-4 text-green-200" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                <span>
                  {isLoading 
                    ? "Sending..." 
                    : justSent
                      ? "Invitations Sent!"
                      : `Send Invitations (${selectedCount})`
                  }
                </span>
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
          disabled={selectedCount === 0 || isLoading || justSent}
          variant={
            justSent 
              ? "secondary" 
              : selectedCount > 0 
                ? "default" 
                : "outline"
          }
          className={`flex items-center gap-2 ${justSent ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : justSent ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          {isLoading 
            ? "Sending..." 
            : justSent
              ? "Invitations Sent!"
              : selectedCount > 0 
                ? `Send Invitations (${selectedCount})`
                : "Select Members to Invite"
          }
        </Button>
      )}
    </div>
  );
};
