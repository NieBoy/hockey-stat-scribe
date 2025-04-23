
import { Invitation, UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface InvitationsListProps {
  invitations: Invitation[];
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onResend?: (id: string) => void;
  onCancel?: (id: string) => void;
  showActions?: boolean;
}

export default function InvitationsList({ 
  invitations, 
  onAccept, 
  onDecline, 
  onResend,
  onCancel,
  showActions = false 
}: InvitationsListProps) {
  const getRoleBadgeColor = (role: UserRole) => {
    switch(role) {
      case 'admin': return "bg-red-100 text-red-800";
      case 'coach': return "bg-blue-100 text-blue-800";
      case 'player': return "bg-green-100 text-green-800";
      case 'parent': return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return "bg-yellow-100 text-yellow-800";
      case 'accepted': return "bg-green-100 text-green-800";
      case 'declined': return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (invitations.length === 0) {
    return (
      <Card className="border border-dashed bg-muted/30">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Mail className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No invitations found</h3>
          <p className="text-muted-foreground text-sm mt-1">
            {showActions ? "You haven't sent any invitations yet" : "You don't have any invitations"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-medium">
                  {invitation.email}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className={getRoleBadgeColor(invitation.role)}>
                    {typeof invitation.role === 'string' ? invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1) : 'Unknown Role'}
                  </Badge>
                  <Badge variant="outline" className={getStatusColor(invitation.status)}>
                    {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                <span>
                  {formatDistanceToNow(new Date(invitation.created_at || invitation.createdAt || ''), { addSuffix: true })}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {showActions ? (
              <div className="flex items-center justify-end gap-2 mt-2">
                {invitation.status === "pending" && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onResend && onResend(invitation.id)}
                    >
                      Resend
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => onCancel && onCancel(invitation.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 mt-2">
                {invitation.status === "pending" && (
                  <>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="gap-1"
                      onClick={() => onAccept && onAccept(invitation.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1"
                      onClick={() => onDecline && onDecline(invitation.id)}
                    >
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
