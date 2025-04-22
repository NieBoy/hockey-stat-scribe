
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
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DeleteTeamDialogProps {
  teamId: string;
  teamName: string;
}

export default function DeleteTeamDialog({ teamId, teamName }: DeleteTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (isDeleting) return; // Prevent multiple clicks
    
    try {
      // Update state to show loading
      setIsDeleting(true);
      
      // Show loading toast
      toast.loading(`Deleting team "${teamName}"...`, {
        id: "team-delete-toast",
        duration: Infinity // Keep showing until we dismiss it
      });
      
      console.log(`Starting deletion of team ${teamId} (${teamName})`);
      
      // Call the deletion service
      const success = await deleteTeamAndAllData(teamId);
      
      // Handle the result
      if (success) {
        // Dismiss loading toast and show success
        toast.dismiss("team-delete-toast");
        toast.success(`Team "${teamName}" has been deleted`, {
          duration: 5000
        });
        
        // Close dialog and navigate away
        setOpen(false);
        
        // Use setTimeout to ensure dialog animation completes before navigation
        setTimeout(() => {
          // Force a full page reload to ensure all state is cleared
          window.location.href = "/teams";
        }, 300);
      } else {
        // Show error toast
        toast.dismiss("team-delete-toast");
        toast.error("Failed to delete team. Please try again.", {
          duration: 5000
        });
        setIsDeleting(false);
      }
    } catch (error) {
      console.error("Error in team deletion:", error);
      
      // Show error toast
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
      >
        <Trash2 className="h-4 w-4" /> Delete Team
      </Button>

      <AlertDialog open={open} onOpenChange={(isOpen) => {
        // Only allow closing if we're not in the middle of deletion
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
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  Yes, Delete Everything
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
