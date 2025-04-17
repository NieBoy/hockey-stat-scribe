import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import Games from "@/pages/Games";
import Teams from "@/pages/Teams";
import NewTeam from "@/pages/NewTeam";
import TeamDetail from "@/pages/TeamDetail";
import NewGame from "@/pages/NewGame";
import GameDetail from "@/pages/GameDetail";
import TrackStats from "@/pages/TrackStats";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster"
import GameTracking from "@/pages/GameTracking";

function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('Auth State:', { isAuthenticated, isLoading });
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/profile",
    element: (
      <RequireAuth>
        <Profile />
      </RequireAuth>
    ),
  },
  {
    path: "/games",
    element: (
      <RequireAuth>
        <Games />
      </RequireAuth>
    ),
  },
  {
    path: "/games/new",
    element: (
      <RequireAuth>
        <NewGame />
      </RequireAuth>
    ),
  },
  {
    path: "/games/:id",
    element: (
      <RequireAuth>
        <GameDetail />
      </RequireAuth>
    ),
  },
   {
    path: "/games/:id/track",
    element: (
      <RequireAuth>
        <GameTracking />
      </RequireAuth>
    ),
  },
  {
    path: "/games/:id/track",
    element: (
      <RequireAuth>
        <TrackStats />
      </RequireAuth>
    ),
  },
  {
    path: "/teams",
    element: (
      <RequireAuth>
        <Teams />
      </RequireAuth>
    ),
  },
  {
    path: "/teams/new",
    element: (
      <RequireAuth>
        <NewTeam />
      </RequireAuth>
    ),
  },
  {
    path: "/teams/:id",
    element: (
      <RequireAuth>
        <TeamDetail />
      </RequireAuth>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}

export default App;
