
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InviteUserForm from "@/components/invitations/InviteUserForm";
import InvitationsList from "@/components/invitations/InvitationsList";
import { Invitation } from "@/types";
import { currentUser, mockTeams } from "@/lib/mock-data";
import { toast } from "sonner";

// Mock invitations data
const mockSentInvitations: Invitation[] = [
  {
    id: '1',
    email: 'newplayer@example.com',
    role: ['player'],
    teamId: '1',
    invitedBy: '1',
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    email: 'newcoach@example.com',
    role: ['coach'],
    invitedBy: '1',
    status: 'accepted',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

const mockReceivedInvitations: Invitation[] = [
  {
    id: '3',
    email: currentUser.email,
    role: ['admin'],
    teamId: '2',
    invitedBy: '6',
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

export default function Invitations() {
  const [sentInvitations, setSentInvitations] = useState<Invitation[]>(mockSentInvitations);
  const [receivedInvitations, setReceivedInvitations] = useState<Invitation[]>(mockReceivedInvitations);
  const [activeTab, setActiveTab] = useState("received");
  
  // Get teams accessible to the current user
  const userTeams = mockTeams;

  const handleAcceptInvitation = (id: string) => {
    setReceivedInvitations(invitations =>
      invitations.map(inv => 
        inv.id === id ? { ...inv, status: 'accepted' } : inv
      )
    );
    toast.success("Invitation accepted", {
      description: "You have been added to the team",
    });
  };

  const handleDeclineInvitation = (id: string) => {
    setReceivedInvitations(invitations =>
      invitations.map(inv => 
        inv.id === id ? { ...inv, status: 'declined' } : inv
      )
    );
    toast.info("Invitation declined");
  };

  const handleCancelInvitation = (id: string) => {
    setSentInvitations(invitations => invitations.filter(inv => inv.id !== id));
    toast.info("Invitation canceled");
  };

  const handleResendInvitation = (id: string) => {
    toast.success("Invitation resent", {
      description: "The invitation has been sent again",
    });
  };

  const handleInvite = (invitation: Partial<Invitation>) => {
    const newInvitation: Invitation = {
      id: Date.now().toString(),
      email: invitation.email || "",
      role: invitation.role || ["player"],
      teamId: invitation.teamId,
      invitedBy: currentUser.id,
      status: "pending",
      createdAt: new Date(),
    };
    
    setSentInvitations([newInvitation, ...sentInvitations]);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Invitations</h1>
          <p className="text-muted-foreground">
            Manage invitations to your teams
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-4 space-y-4">
            <h2 className="text-xl font-semibold">Invitations Received</h2>
            <InvitationsList 
              invitations={receivedInvitations}
              onAccept={handleAcceptInvitation}
              onDecline={handleDeclineInvitation}
            />
          </TabsContent>

          <TabsContent value="sent" className="mt-4 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Send New Invitation</h2>
                <InviteUserForm 
                  teams={userTeams}
                  onInvite={handleInvite}
                />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Sent Invitations</h2>
                <InvitationsList 
                  invitations={sentInvitations}
                  onResend={handleResendInvitation}
                  onCancel={handleCancelInvitation}
                  showActions={true}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
