
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TeamDetailErrorProps {
  error: Error;
}

export default function TeamDetailError({ error }: TeamDetailErrorProps) {
  const navigate = useNavigate();
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Error Loading Team</h1>
        <p className="text-red-500">{error.message}</p>
        <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
      </div>
    </MainLayout>
  );
}
