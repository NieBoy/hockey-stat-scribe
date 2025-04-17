
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { createTeam } from "@/services/teams";
import { useAuth } from "@/hooks/useAuth";

// Make organizationId optional in the schema
const teamSchema = z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 characters" }),
  organizationId: z.string().optional(),
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
      organizationId: "",
    },
  });

  const onSubmit = async (data: TeamFormValues) => {
    setIsSubmitting(true);
    try {
      const teamData = {
        name: data.name,
        // Use a default value for organizationId if not provided
        organizationId: data.organizationId || "default"
      };
      
      // In a real app, we would save to database here
      await createTeam(teamData);
      
      // Force refresh the teams data
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      
      toast.success("Team created successfully", {
        description: `${data.name} has been added to your organization`,
      });
      
      // Navigate to profile page after successful team creation
      setTimeout(() => {
        navigate(`/profile`);
      }, 1000);
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

              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="default">Default Organization</SelectItem>
                        {(user?.organizations || []).map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-1">
                      You can create a team without selecting an organization
                    </p>
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
