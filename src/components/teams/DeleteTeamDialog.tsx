
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTeamAndAllData } from "@/services/teams/teamDeletion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteTeamDialogProps {
  teamId: string;
  teamName: string;
  onTeamDeleted?: (teamId: string) => void; // NEW: Optional callback prop
}

export default function DeleteTeamDialog({ teamId, teamName, onTeamDeleted }: DeleteTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    toast.loading(`Deleting team "${teamName}"...`, {
      id: "team-delete-toast",
      duration: Infinity
    });

    try {
      const success = await deleteTeamAndAllData(teamId);
      toast.dismiss("team-delete-toast");
      if (success) {
        toast.success(`Team "${teamName}" has been deleted`, {
          duration: 5000
        });
        setOpen(false);

        // Remove team data from react-query cache
        queryClient.removeQueries({ queryKey: ['teams'] });
        queryClient.removeQueries({ queryKey: ['team', teamId] });

        // NEW: Optimistically update the parent (Teams page) if callback is provided
        if (onTeamDeleted) {
          onTeamDeleted(teamId);
        }

        // Wait a moment to ensure any database replication is complete
        setTimeout(() => {
          // First navigate away (if on a detail page this works)
          navigate("/teams", { replace: true });
          // Optionally: window.location.href = "/teams";
        }, 500);
      } else {
        toast.error("Failed to delete team. Please try again.", {
          duration: 5000
        });
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      toast.dismiss("team-delete-toast");
      toast.error("An unexpected error occurred", {
        duration: 5000
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
        disabled={isDeleting}
        aria-disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" /> Delete Team
      </Button>

      <AlertDialog open={open} onOpenChange={(isOpen) => {
        // Prevent closing dialog mid-delete
        if (!isDeleting) setOpen(isOpen);
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team: {teamName}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="font-semibold text-destructive">This action cannot be undone.</p>
              <p>This will permanently delete:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>The team "{teamName}"</li>
                <li>All players, coaches, and members</li>
                <li>All games played by this team</li>
                <li>All statistics and events</li>
                <li>Player-parent relationships</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} aria-disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              aria-disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Yes, Delete Everything</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
