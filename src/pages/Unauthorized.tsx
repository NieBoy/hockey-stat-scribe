
import { Button } from "@/components/ui/button";
import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <ShieldX className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-4xl font-bold">Access Denied</h1>
        <p className="mt-2 text-muted-foreground">
          You don't have permission to access this page.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link to="/">
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
