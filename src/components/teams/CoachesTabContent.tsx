
import React, { useState } from "react";
import { Team } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Plus } from "lucide-react";
import CoachCard from "./CoachCard";
import CoachAddForm from "./CoachAddForm";

interface CoachesTabContentProps {
  team: Team;
  onCoachAdded?: () => void;
}

const CoachesTabContent = ({ team, onCoachAdded }: CoachesTabContentProps) => {
  const [showAddCoach, setShowAddCoach] = useState(false);
  
  const handleCoachAdded = () => {
    setShowAddCoach(false);
    // Call the callback to refresh team data in parent component
    if (onCoachAdded) {
      onCoachAdded();
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Coaches</h3>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={() => setShowAddCoach(!showAddCoach)}
        >
          <Plus className="h-4 w-4" /> 
          {showAddCoach ? 'Hide' : 'Add Coach'}
        </Button>
      </div>
      
      {showAddCoach && (
        <div className="mb-4">
          <CoachAddForm 
            teamId={team.id} 
            onCoachAdded={handleCoachAdded} 
          />
        </div>
      )}
      
      {team.coaches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.coaches.map(coach => (
            <CoachCard key={coach.id} coach={coach} />
          ))}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 pb-6 text-center">
            <UserCog className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No coaches found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This team doesn't have any coaches yet.
            </p>
            {!showAddCoach && (
              <Button className="mt-4" onClick={() => setShowAddCoach(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Coach
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CoachesTabContent;
