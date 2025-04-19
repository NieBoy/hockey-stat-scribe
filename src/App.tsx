
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Games from "@/pages/Games";
import Teams from "@/pages/Teams";
import TeamCreate from "@/pages/TeamCreate";
import TeamDetail from "@/pages/TeamDetail";
import TeamLineup from "@/pages/TeamLineup";
import NewGame from "@/pages/NewGame";
import GameDetail from "@/pages/GameDetail";
import TrackStats from "@/pages/TrackStats";
import { useAuth, AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"
import GameTracking from "@/pages/GameTracking";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import StatTrackerAssignment from "@/pages/StatTrackerAssignment";
import PlayerDetail from "@/pages/PlayerDetail";
import PlayerStats from "@/pages/PlayerStats";
import NotFound from "@/pages/NotFound";
import Stats from "@/pages/Stats";
import Stars from "@/pages/Stars";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    console.log('Auth State:', { user, loading });
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/profile" element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      } />
      <Route path="/games" element={
        <RequireAuth>
          <Games />
        </RequireAuth>
      } />
      <Route path="/games/new" element={
        <RequireAuth>
          <NewGame />
        </RequireAuth>
      } />
      <Route path="/games/:id" element={
        <RequireAuth>
          <GameDetail />
        </RequireAuth>
      } />
      <Route path="/games/:id/track" element={
        <RequireAuth>
          <GameTracking />
        </RequireAuth>
      } />
      <Route path="/games/:id/assign-trackers" element={
        <RequireAuth>
          <StatTrackerAssignment />
        </RequireAuth>
      } />
      <Route path="/stats/track/:id" element={
        <RequireAuth>
          <TrackStats />
        </RequireAuth>
      } />
      <Route path="/teams" element={
        <RequireAuth>
          <Teams />
        </RequireAuth>
      } />
      <Route path="/teams/new" element={
        <RequireAuth>
          <TeamCreate />
        </RequireAuth>
      } />
      <Route path="/teams/:id" element={
        <RequireAuth>
          <TeamDetail />
        </RequireAuth>
      } />
      <Route path="/teams/:id/lineup" element={
        <RequireAuth>
          <TeamLineup />
        </RequireAuth>
      } />
      <Route path="/players/:id" element={
        <RequireAuth>
          <PlayerDetail />
        </RequireAuth>
      } />
      <Route path="/players/:id/stats" element={
        <RequireAuth>
          <PlayerStats />
        </RequireAuth>
      } />
      <Route path="/stats" element={
        <RequireAuth>
          <Stats />
        </RequireAuth>
      } />
      <Route path="/stars" element={
        <RequireAuth>
          <Stars />
        </RequireAuth>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
