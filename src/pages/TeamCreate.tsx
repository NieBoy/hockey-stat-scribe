
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { createTeam } from "@/services/teams";
import { useAuth } from "@/hooks/useAuth";

const teamSchema = z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 characters" }),
});

type TeamFormValues = z.infer<typeof teamSchema>;

export default function TeamCreate() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (data: TeamFormValues) => {
    if (!user) {
      toast.error("You must be logged in to create a team");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const teamData = {
        name: data.name
      };
      
      console.log("Creating team:", teamData);
      const newTeam = await createTeam(teamData);
      console.log("Team created response:", newTeam);
      
      // Force refresh the teams data
      await queryClient.invalidateQueries({ queryKey: ['teams'] });
      
      toast.success("Team created successfully", {
        description: `${data.name} has been added`,
      });
      
      // Immediately navigate to teams page to show the new team
      setTimeout(() => {
        navigate(`/teams`);
      }, 500);
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Failed to create team", {
        description: "There was an error creating the team. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Create New Team</h1>
          <p className="text-muted-foreground">
            Set up a new hockey team
          </p>
        </div>

        <Card className="p-6 max-w-2xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/teams")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Team"}
                </Button>
              </div>
            </form>
          </Form>
        </Card>
      </div>
    </MainLayout>
  );
}
