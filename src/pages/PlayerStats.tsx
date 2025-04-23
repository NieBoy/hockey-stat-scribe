
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

export default function PlayerStats() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the Stars page which is now the main stats leaderboard
    navigate('/stars');
  }, [navigate]);

  return (
    <MainLayout>
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">Redirecting to Stars Leaderboard...</h1>
        <p className="text-muted-foreground">Please wait while you're being redirected to the new stats experience.</p>
      </div>
    </MainLayout>
  );
}
