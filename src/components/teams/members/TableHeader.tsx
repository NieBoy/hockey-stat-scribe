
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface TableHeaderProps {
  selectedCount: number;
  onSendInvitations: () => void;
}

export const TableHeader = ({ selectedCount, onSendInvitations }: TableHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-medium">Team Members</h3>
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
    </div>
  );
};
