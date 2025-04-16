
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/new" element={<NewGame />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/games/:id/track" element={<TrackStats />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/new" element={<TeamCreate />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/teams/:id/lineup" element={<TeamLineup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
