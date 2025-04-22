
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
import { Trash2 } from "lucide-react";
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
    
    setIsDeleting(true);
    
    try {
      console.log(`DeleteTeamDialog: Starting deletion process for team ${teamId} (${teamName})`);
      const success = await deleteTeamAndAllData(teamId);
      
      if (success) {
        toast.success(`Team "${teamName}" and all associated data has been deleted`);
        
        setOpen(false);
        // Short timeout to allow the dialog to close before navigation
        setTimeout(() => {
          navigate("/teams");
        }, 300);
      } else {
        toast.error("Failed to delete team. Please try again.");
      }
    } catch (error) {
      console.error("Error in delete team dialog:", error);
      toast.error("An unexpected error occurred while deleting the team");
    } finally {
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
      >
        <Trash2 className="h-4 w-4" /> Delete Team
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
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
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
