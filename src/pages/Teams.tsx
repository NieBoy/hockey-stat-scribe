import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Plus, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTeams } from "@/hooks/useTeams";
import TeamsGrid from "@/components/teams/TeamsGrid";
import EmptyTeamsState from "@/components/teams/EmptyTeamsState";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import { Team } from "@/types";

export default function Teams() {
  const { user } = useAuth();
  const {
    teams,
    isLoading,
    error,
    refetch,
    addPlayerDialogOpen,
    setAddPlayerDialogOpen,
    selectedTeam,
    newPlayer,
    setNewPlayer,
    handleAddPlayer,
    submitNewPlayer
  } = useTeams();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <p className="text-red-500">Error loading teams: {(error as Error).message}</p>
          <Button onClick={() => refetch()} className="mt-4">Retry</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Teams</h1>
          <p className="text-muted-foreground">
            View and manage hockey teams.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link to="/profile">
              <UserCircle2 className="h-4 w-4" /> Edit Profile
            </Link>
          </Button>
          {user?.role.includes('coach') && (
            <Button asChild className="gap-2">
              <Link to="/teams/new">
                <Plus className="h-4 w-4" /> New Team
              </Link>
            </Button>
          )}
        </div>
      </div>

      {teams && (teams as Team[]).length > 0 ? (
        <TeamsGrid teams={teams as Team[]} onAddPlayer={handleAddPlayer} />
      ) : (
        <EmptyTeamsState user={user} />
      )}

      <AddPlayerDialog
        isOpen={addPlayerDialogOpen}
        onOpenChange={setAddPlayerDialogOpen}
        selectedTeam={selectedTeam}
        onSubmit={submitNewPlayer}
        newPlayer={newPlayer}
        setNewPlayer={setNewPlayer}
      />
    </MainLayout>
  );
}
