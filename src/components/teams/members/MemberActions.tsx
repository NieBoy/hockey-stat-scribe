
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Trash, Edit } from "lucide-react";
import { User } from "@/types";

interface MemberActionsProps {
  member: User;
  onEdit?: (member: User) => void;
  onDelete: (member: User) => void;
}

export const MemberActions = ({ member, onEdit, onDelete }: MemberActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(member)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        {!member.email && onEdit && (
          <DropdownMenuItem onClick={() => onEdit(member)}>
            <Mail className="mr-2 h-4 w-4" />
            Add email
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => onDelete(member)}
          className="text-red-600 hover:text-red-600 focus:text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
