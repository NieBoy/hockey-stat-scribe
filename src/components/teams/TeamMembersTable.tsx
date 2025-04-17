
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Trash, Edit } from "lucide-react";
import { User, Team } from "@/types";
import { toast } from "sonner";

// Define columns for the data table
const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }: any) => {
      const role = row.original.role?.[0] || "player";
      return <span className="capitalize">{role}</span>;
    },
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "number",
    header: "#",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }: any) => {
      const email = row.original.email;
      return email ? (
        <span>{email}</span>
      ) : (
        <span className="text-muted-foreground italic">No email</span>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const member = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Edit", member)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {!member.email && (
              <DropdownMenuItem onClick={() => console.log("Add email", member)}>
                <Mail className="mr-2 h-4 w-4" />
                Add email
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => console.log("Remove", member)}
              className="text-red-600 hover:text-red-600 focus:text-red-600"
            >
              <Trash className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface TeamMembersTableProps {
  team: Team;
  onSendInvitations?: (memberIds: string[]) => void;
  onEditMember?: (member: User) => void;
  onRemoveMember?: (member: User) => void;
}

const TeamMembersTable = ({ 
  team,
  onSendInvitations,
  onEditMember,
  onRemoveMember
}: TeamMembersTableProps) => {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // Combine players, coaches, and parents into a single array
  const allMembers = [
    ...(team.players || []),
    ...(team.coaches || []),
    ...(team.parents || [])
  ];

  const handleSendInvitations = () => {
    if (selectedMembers.length === 0) {
      toast.error("No members selected");
      return;
    }
    
    if (onSendInvitations) {
      onSendInvitations(selectedMembers);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Team Members</h3>
        <Button 
          onClick={handleSendInvitations}
          disabled={selectedMembers.length === 0}
        >
          <Mail className="mr-2 h-4 w-4" />
          Send Invitations ({selectedMembers.length})
        </Button>
      </div>
      
      <DataTable 
        columns={columns} 
        data={allMembers} 
        searchKey="name" 
      />
    </div>
  );
};

export default TeamMembersTable;
