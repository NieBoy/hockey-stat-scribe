
import React from 'react';
import { Team } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SimplePlayerList from './SimplePlayerList';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface QuickLineupViewProps {
  team: Team;
}

export function QuickLineupView({ team }: QuickLineupViewProps) {
  const navigate = useNavigate();
  
  // Sort players by number when possible
  const sortedPlayers = [...team.players].sort((a, b) => {
    const numA = a.number ? parseInt(a.number) : 999;
    const numB = b.number ? parseInt(b.number) : 999;
    return numA - numB;
  });

  const handleEditClick = () => {
    navigate(`/teams/${team.id}/lineup`);
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Team Roster</CardTitle>
        <Button onClick={handleEditClick}>Edit</Button>
      </CardHeader>
      <CardContent>
        <SimplePlayerList players={sortedPlayers} />
      </CardContent>
    </Card>
  );
}
