
import React from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "@/types";

interface EmptyTeamsStateProps {
  user: User | null;
}

export default function EmptyTeamsState({ user }: EmptyTeamsStateProps) {
  return (
    <div className="text-center py-12 border rounded-lg bg-muted/20">
      <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
      <h3 className="mt-4 text-lg font-medium">No teams yet</h3>
      <p className="mt-1 text-muted-foreground">
        Create your first team to get started
      </p>
      {user?.role.includes('coach') && (
        <Button className="mt-4" asChild>
          <Link to="/teams/new">
            <Plus className="mr-2 h-4 w-4" /> Create New Team
          </Link>
        </Button>
      )}
    </div>
  );
}
