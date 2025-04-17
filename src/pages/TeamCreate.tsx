
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
import { mockOrganizations, currentUser } from "@/lib/mock-data";
import { toast } from "sonner";
import { createTeam } from "@/services/teams";
import { useAuth } from "@/hooks/useAuth";

const teamSchema = z.object({
  name: z.string().min(3, { message: "Team name must be at least 3 characters" }),
  organizationId: z.string().min(1, { message: "Please select an organization" }),
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
      // In a real app, we would save to database here
      await createTeam(data);
      
      // Invalidate teams cache to force a refresh
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
            Set up a new hockey team in your organization
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
                    <FormLabel>Organization</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select organization" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(user?.organizations || []).map((org) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                        {/* Fallback if no organizations */}
                        {(!user?.organizations || user.organizations.length === 0) && (
                          <SelectItem value="default">Default Organization</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
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
