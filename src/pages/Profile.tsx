
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProfileTabs from "@/components/profile/ProfileTabs";
import { useProfileData } from "@/hooks/useProfileData";

export default function Profile() {
  const { user } = useAuth();
  
  // Use the custom hook for profile data management
  const { 
    teams, 
    allPlayers, 
    teamsLoading, 
    teamsError, 
    refetch,
    filterUserTeams 
  } = useProfileData(user);

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  const isAdmin = user.role.includes('admin');
  const isCoach = user.role.includes('coach');
  const isPlayer = user.role.includes('player');
  const isParent = user.role.includes('parent');

  // Get teams for the current user
  const userTeams = filterUserTeams(user);
  console.log("Filtered user teams:", userTeams);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.name}'s Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and view your teams and stats
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <ProfileTabs
          user={user}
          teams={userTeams}
          allPlayers={allPlayers}
          isAdmin={isAdmin}
          isCoach={isCoach}
          isParent={isParent}
          teamsLoading={teamsLoading}
          teamsError={teamsError}
          refetchTeams={refetch}
        />
      </div>
    </MainLayout>
  );
}
