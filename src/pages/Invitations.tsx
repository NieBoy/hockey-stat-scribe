import React from 'react';
import { Invitation } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCheck, MailWarning } from 'lucide-react';

const mockInvitations: Invitation[] = [
  {
    id: '1',
    email: 'coach1@example.com',
    team_id: 'team-1', // Add this required field
    role: 'coach',
    status: 'accepted',
    created_at: '2023-01-01T00:00:00Z',
    invitedBy: 'John Smith' 
  },
  {
    id: '2',
    email: 'player2@example.com',
    team_id: 'team-2', // Add this required field
    role: 'player',
    status: 'pending',
    created_at: '2023-02-15T00:00:00Z',
    invitedBy: 'Alice Johnson'
  },
  {
    id: '3',
    email: 'parent3@example.com',
    team_id: 'team-1', // Add this required field
    role: 'parent',
    status: 'pending',
    created_at: '2023-03-20T00:00:00Z',
    invitedBy: 'Bob Williams'
  },
];

const Invitations = () => {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Team Invitations</CardTitle>
          <CardContent>
            Manage your team invitations here.
          </CardContent>
        </CardHeader>
        <CardContent>
          {mockInvitations.map((invitation) => (
            <div key={invitation.id} className="mb-4 p-4 border rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{invitation.email}</p>
                  <p className="text-sm text-gray-500">
                    Invited by: {invitation.invitedBy}
                  </p>
                  <p className="text-sm text-gray-500">
                    Date: {new Date(invitation.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  {invitation.status === 'pending' && (
                    <Badge variant="secondary" className="gap-1.5">
                      <MailWarning className="h-4 w-4" />
                      Pending
                    </Badge>
                  )}
                  {invitation.status === 'accepted' && (
                    <Badge variant="outline" className="gap-1.5">
                      <CheckCheck className="h-4 w-4" />
                      Accepted
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invitations;
