
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface InvitationErrorProps {
  error: string;
}

export function InvitationError({ error }: InvitationErrorProps) {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center py-8 text-center">
      <XCircle className="h-12 w-12 text-destructive mb-2" />
      <h3 className="text-lg font-semibold">Invalid Invitation</h3>
      <p className="mt-1 text-sm text-muted-foreground">{error}</p>
      <Button className="mt-6" onClick={() => navigate("/")}>
        Return Home
      </Button>
    </div>
  );
}
