
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import TeamCreate from "./pages/TeamCreate";
import TeamLineup from "./pages/TeamLineup";
import Stats from "./pages/Stats";
import Games from "./pages/Games";
import GameDetail from "./pages/GameDetail";
import NewGame from "./pages/NewGame";
import GameTracking from "./pages/GameTracking";
import TrackStats from "./pages/TrackStats";
import StatTrackerAssignment from "./pages/StatTrackerAssignment";
import PlayerDetail from "./pages/PlayerDetail";
import PlayerStats from "./pages/PlayerStats";
import Profile from "./pages/Profile";
import Stars from "./pages/Stars";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import Invitations from "./pages/Invitations";
import AcceptInvitation from "./pages/AcceptInvitation";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./hooks/useAuth";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/create" element={<TeamCreate />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/teams/:id/lineup" element={<TeamLineup />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/create" element={<NewGame />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/games/:id/track" element={<GameTracking />} />
          <Route path="/games/:id/track/:statType" element={<TrackStats />} />
          <Route path="/games/:id/trackers" element={<StatTrackerAssignment />} />
          <Route path="/players/:id" element={<PlayerDetail />} />
          <Route path="/players/:id/stats" element={<PlayerStats />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stars" element={<Stars />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/invitations" element={<Invitations />} />
          <Route path="/accept-invitation" element={<AcceptInvitation />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
