
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function TeamDetailNotFound() {
  const navigate = useNavigate();
  
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
