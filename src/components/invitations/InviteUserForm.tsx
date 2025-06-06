
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Invitation, Team } from "@/types";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const invitationSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  role: z.string({ required_error: "Please select a role" }),
  teamId: z.string().optional(),
});

type InvitationFormValues = z.infer<typeof invitationSchema>;

interface InviteUserFormProps {
  teams: Team[];
  onInvite: (invitation: Partial<Invitation>) => void;
}

export default function InviteUserForm({ teams, onInvite }: InviteUserFormProps) {
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: "",
      role: "",
      teamId: undefined,
    },
  });

  const onSubmit = (values: InvitationFormValues) => {
    const invitation: Partial<Invitation> = {
      email: values.email,
      role: values.role as any,
      team_id: values.teamId,
      status: "pending",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };
    
    onInvite(invitation);
    toast.success("Invitation sent successfully", {
      description: `${values.email} has been invited as a ${values.role}`,
      action: {
        label: "Dismiss",
        onClick: () => console.log("Dismissed"),
      },
    });
    form.reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Invite User</CardTitle>
        <CardDescription>Send an invitation to join your team</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="player">Player</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Send Invitation
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
