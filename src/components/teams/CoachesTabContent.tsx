
import React from "react";
import { Team } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCog, Plus } from "lucide-react";
import CoachCard from "./CoachCard";

interface CoachesTabContentProps {
  team: Team;
}

const CoachesTabContent = ({ team }: CoachesTabContentProps) => {
  return (
    <>
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
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Coach
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default CoachesTabContent;
