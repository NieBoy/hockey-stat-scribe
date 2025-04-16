
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Games from "./pages/Games";
import NewGame from "./pages/NewGame";
import GameDetail from "./pages/GameDetail";
import TrackStats from "./pages/TrackStats";
import Stats from "./pages/Stats";
import Teams from "./pages/Teams";
import TeamCreate from "./pages/TeamCreate";
import TeamDetail from "./pages/TeamDetail";
import TeamLineup from "./pages/TeamLineup";
import Profile from "./pages/Profile";
import Invitations from "./pages/Invitations";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Unauthorized from "./pages/Unauthorized";
import { AuthProvider } from "./hooks/useAuth";
import RequireAuth from "./components/auth/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Protected routes */}
            <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
            <Route path="/games" element={<RequireAuth><Games /></RequireAuth>} />
            <Route path="/games/new" element={<RequireAuth roles={['coach', 'admin']}><NewGame /></RequireAuth>} />
            <Route path="/games/:id" element={<RequireAuth><GameDetail /></RequireAuth>} />
            <Route path="/games/:id/track" element={<RequireAuth><TrackStats /></RequireAuth>} />
            <Route path="/stats" element={<RequireAuth><Stats /></RequireAuth>} />
            <Route path="/teams" element={<RequireAuth><Teams /></RequireAuth>} />
            <Route path="/teams/new" element={<RequireAuth roles={['coach', 'admin']}><TeamCreate /></RequireAuth>} />
            <Route path="/teams/:id" element={<RequireAuth><TeamDetail /></RequireAuth>} />
            <Route path="/teams/:id/lineup" element={<RequireAuth roles={['coach', 'admin']}><TeamLineup /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/invitations" element={<RequireAuth><Invitations /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
