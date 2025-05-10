// Import the necessary components and hooks
import { useState } from 'react';
import { User, Team } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define props interface for TeamMembersTable
interface TeamMembersTableProps {
  team: Team;
  players?: User[];
  coaches?: User[];
  parents?: User[];
  loading?: boolean;
  error?: string;
  selectedMembers?: string[];
  memberToDelete?: string | null;
  allMembers?: User[];
  handleSelectMember?: (memberId: string, selected: boolean) => void;
  handleSelectAll?: () => void;
  handleDeleteConfirm?: () => void;
  handleDelete?: (memberId: string) => void;
  setMemberToDelete?: (memberId: string | null) => void;
  onEdit?: (member: User) => void;
  onSendInvitations?: (memberIds: string[]) => void;
  onRemoveMember?: (member: User) => void;
  isSendingInvitations?: boolean;
  lastInvitationSent?: Date | null;
  invitationLinks?: string[];
}

export default function TeamMembersTable({
  team,
  players = [],
  coaches = [],
  parents = [],
  loading = false,
  error = '',
  selectedMembers = [],
  memberToDelete = null,
  allMembers = [],
  handleSelectMember = () => {},
  handleSelectAll = () => {},
  handleDeleteConfirm = () => {},
  handleDelete = () => {},
  setMemberToDelete = () => {},
  onEdit,
  onSendInvitations,
  onRemoveMember,
  isSendingInvitations = false,
  lastInvitationSent = null,
  invitationLinks = []
}: TeamMembersTableProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'players' | 'coaches' | 'parents'>('all');
  
  // If team is provided but players/coaches/parents aren't, use team properties
  const actualPlayers = players.length > 0 ? players : (team?.players as User[] || []);
  const actualCoaches = coaches.length > 0 ? coaches : (team?.coaches || []);
  const actualParents = parents.length > 0 ? parents : (team?.parents || []);
  const actualAllMembers = allMembers.length > 0 ? allMembers : [
    ...actualPlayers,
    ...actualCoaches,
    ...actualParents
  ];

  const renderMemberRow = (member: User) => (
    <TableRow key={member.id}>
      <TableCell className="w-10">
        <Checkbox
          checked={selectedMembers.includes(member.id)}
          onCheckedChange={(checked) => handleSelectMember(member.id, !!checked)}
        />
      </TableCell>
      <TableCell>{member.name}</TableCell>
      <TableCell>{member.email}</TableCell>
      <TableCell>
        <Badge variant="outline" className="capitalize">
          {Array.isArray(member.role) ? member.role[0] : member.role}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          {onEdit && (
            <Button variant="ghost" size="icon" onClick={() => onEdit(member)}>
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMemberToDelete(member.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const getMembersToDisplay = () => {
    switch (activeTab) {
      case 'players':
        return actualPlayers;
      case 'coaches':
        return actualCoaches;
      case 'parents':
        return actualParents;
      default:
        return actualAllMembers;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex space-x-2 mb-4">
        <Button
          variant={activeTab === 'all' ? 'default' : 'outline'}
          onClick={() => setActiveTab('all')}
        >
          All ({actualAllMembers.length})
        </Button>
        <Button
          variant={activeTab === 'players' ? 'default' : 'outline'}
          onClick={() => setActiveTab('players')}
        >
          Players ({actualPlayers.length})
        </Button>
        <Button
          variant={activeTab === 'coaches' ? 'default' : 'outline'}
          onClick={() => setActiveTab('coaches')}
        >
          Coaches ({actualCoaches.length})
        </Button>
        <Button
          variant={activeTab === 'parents' ? 'default' : 'outline'}
          onClick={() => setActiveTab('parents')}
        >
          Parents ({actualParents.length})
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={
                    getMembersToDisplay().length > 0 &&
                    getMembersToDisplay().every(member => 
                      selectedMembers.includes(member.id)
                    )
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getMembersToDisplay().length > 0 ? (
              getMembersToDisplay().map(renderMemberRow)
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No team members found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
