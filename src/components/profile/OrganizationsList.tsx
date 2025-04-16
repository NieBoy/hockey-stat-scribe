
import { Link } from "react-router-dom";
import { Organization } from "@/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building, Users } from "lucide-react";

interface OrganizationsListProps {
  organizations: Organization[];
  isAdmin?: boolean;
}

export default function OrganizationsList({ organizations, isAdmin = false }: OrganizationsListProps) {
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Organizations</h2>
        {isAdmin && (
          <Button asChild>
            <Link to="/organizations/new">
              <Plus className="mr-2 h-4 w-4" /> Add Organization
            </Link>
          </Button>
        )}
      </div>
      
      {organizations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizations.map((org) => (
            <Card key={org.id}>
              <CardHeader className="pb-2">
                <CardTitle>{org.name}</CardTitle>
                <CardDescription>
                  {org.teams.length} teams
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{org.admins.length} Administrators</span>
                  </div>
                  {org.teams.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Teams:</p>
                      <div className="flex flex-wrap gap-1">
                        {org.teams.slice(0, 3).map((team) => (
                          <span key={team.id} className="text-xs px-2 py-1 bg-secondary/50 rounded-full">
                            {team.name}
                          </span>
                        ))}
                        {org.teams.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-secondary/50 rounded-full">
                            +{org.teams.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link to={`/organizations/${org.id}`}>Manage</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="pt-6 pb-6 text-center">
            <Building className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-lg font-medium">No organizations found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You are not associated with any organizations yet.
            </p>
            {isAdmin && (
              <Button className="mt-4" asChild>
                <Link to="/organizations/new">
                  <Plus className="mr-2 h-4 w-4" /> Create an organization
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
