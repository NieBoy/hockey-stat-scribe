
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { User } from "@/types";
import { MemberActions } from "./MemberActions";

interface MembersTableContentProps {
  members: User[];
  selectedMembers: string[];
  onSelectMember: (memberId: string) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit?: (member: User) => void;
  onDelete: (member: User) => void;
}

export const MembersTableContent = ({ 
  members,
  selectedMembers,
  onSelectMember,
  onSelectAll,
  onEdit,
  onDelete
}: MembersTableContentProps) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]">
              <Input 
                type="checkbox" 
                className="h-4 w-4" 
                onChange={(e) => onSelectAll(e.target.checked)}
                checked={selectedMembers.length === members.length && members.length > 0}
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
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                No team members found
              </TableCell>
            </TableRow>
          ) : (
            members.map(member => (
              <TableRow key={member.id}>
                <TableCell>
                  <Input 
                    type="checkbox" 
                    className="h-4 w-4" 
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => onSelectMember(member.id)}
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
                  <MemberActions 
                    member={member}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
