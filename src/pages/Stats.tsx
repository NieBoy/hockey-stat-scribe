
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Trophy, Activity } from "lucide-react";
import { Link } from "react-router-dom";

export default function StatsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Statistics Dashboard</h1>
          <p className="text-muted-foreground">
            View and analyze player and team statistics
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Stars Leaderboard
              </CardTitle>
              <CardDescription>
                View the top performing players across all teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/stars">View Leaderboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Team Statistics
              </CardTitle>
              <CardDescription>
                Analyze team performance and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/teams">View Team Stats</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Individual Stats
              </CardTitle>
              <CardDescription>
                View detailed player statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                Access individual player stats through team rosters or the Stars leaderboard
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
