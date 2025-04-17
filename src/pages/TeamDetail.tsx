
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddPlayerDialog from "@/components/teams/AddPlayerDialog";
import { useTeams } from "@/hooks/useTeams";
import TeamHeader from "@/components/teams/TeamHeader";
import PlayersTabContent from "@/components/teams/PlayersTabContent";
import CoachesTabContent from "@/components/teams/CoachesTabContent";
import StatsTabContent from "@/components/teams/StatsTabContent";

export default function TeamDetail() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("players");
  
  const { 
    addPlayerDialogOpen, 
    setAddPlayerDialogOpen, 
    newPlayer,
    setNewPlayer,
    handleAddPlayer,
    submitNewPlayer,
    selectedTeam,
    handleRemovePlayer,
    team,
    isLoadingTeam,
    teamError
  } = useTeams(id);
  
  if (isLoadingTeam) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (teamError) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Error Loading Team</h1>
          <p className="text-red-500">{(teamError as Error).message}</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }

  if (!team) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Team Not Found</h1>
          <p>The team you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <TeamHeader 
          team={team}
          onBackClick={() => navigate("/teams")}
          onAddPlayerClick={handleAddPlayer}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="coaches">Coaches</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="players" className="space-y-4">
            <PlayersTabContent 
              team={team} 
              handleAddPlayer={handleAddPlayer} 
              handleRemovePlayer={handleRemovePlayer} 
            />
          </TabsContent>
          
          <TabsContent value="coaches" className="space-y-4">
            <CoachesTabContent team={team} />
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <StatsTabContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Player Dialog */}
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
