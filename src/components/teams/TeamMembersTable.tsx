
import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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

  const handleSelectMember = (memberId: string) => {
    setSelectedMembers(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

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
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Input 
                  type="checkbox" 
                  className="h-4 w-4" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      const allMemberIds = allMembers.map(m => m.id);
                      setSelectedMembers(allMemberIds);
                    } else {
                      setSelectedMembers([]);
                    }
                  }}
                  checked={selectedMembers.length === allMembers.length && allMembers.length > 0}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>#</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No team members found
                </TableCell>
              </TableRow>
            ) : (
              allMembers.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Input 
                      type="checkbox" 
                      className="h-4 w-4" 
                      checked={selectedMembers.includes(member.id)}
                      onChange={() => handleSelectMember(member.id)}
                    />
                  </TableCell>
                  <TableCell>{member.name}</TableCell>
                  <TableCell>
                    <span className="capitalize">{member.role?.[0] || "player"}</span>
                  </TableCell>
                  <TableCell>{member.position || "-"}</TableCell>
                  <TableCell>{member.number || "-"}</TableCell>
                  <TableCell>
                    {member.email ? (
                      <span>{member.email}</span>
                    ) : (
                      <span className="text-muted-foreground italic">No email</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditMember && onEditMember(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {!member.email && (
                          <DropdownMenuItem onClick={() => onEditMember && onEditMember(member)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Add email
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onRemoveMember && onRemoveMember(member)}
                          className="text-red-600 hover:text-red-600 focus:text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TeamMembersTable;
