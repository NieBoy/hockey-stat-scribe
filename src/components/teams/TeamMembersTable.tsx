
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
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [allMembers, setAllMembers] = useState([
    ...(team.players || []),
    ...(team.coaches || []),
    ...(team.parents || [])
  ]);
  
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

  const confirmDelete = (member: User) => {
    setMemberToDelete(member);
  };
  
  const handleDelete = async () => {
    if (memberToDelete && onRemoveMember) {
      // Optimistically remove the member from the local state
      setAllMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      
      // Call the parent handler
      await onRemoveMember(memberToDelete);
      
      // Clear selected member if they were selected
      setSelectedMembers(prev => prev.filter(id => id !== memberToDelete.id));
      
      // Clear the deletion state
      setMemberToDelete(null);
      
      // Show success message
      toast.success(`${memberToDelete.name} has been removed from the team`);
    }
  };
  
  const cancelDelete = () => {
    setMemberToDelete(null);
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
                  <TableCell>
                    <Link 
                      to={`/players/${member.id}`}
                      className="hover:underline text-primary"
                    >
                      {member.name}
                    </Link>
                  </TableCell>
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
                          onClick={() => confirmDelete(member)}
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

      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {memberToDelete?.name} from the team.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default TeamMembersTable;
