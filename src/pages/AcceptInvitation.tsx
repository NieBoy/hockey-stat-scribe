
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { InvitationForm } from "@/components/invitations/InvitationForm";
import { InvitationError } from "@/components/invitations/InvitationError";
import { useInvitationForm } from "@/hooks/invitations/useInvitationForm";

export default function AcceptInvitation() {
  const {
    form,
    loading,
    error,
    invitation,
    validating,
    validateInvitation,
    onSubmit,
    invitationId
  } = useInvitationForm();

  useEffect(() => {
    validateInvitation();
  }, []);

  if (!invitationId) {
    return <Navigate to="/" />;
  }

  return (
    <MainLayout>
      <div className="container max-w-md mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              Create your account to join the team
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Validating invitation...</p>
              </div>
            ) : error ? (
              <InvitationError error={error} />
            ) : (
              <InvitationForm 
                form={form} 
                onSubmit={onSubmit} 
                validating={validating}
                invitation={invitation}
              />
            )}
          </CardContent>
          <CardFooter className="flex justify-center flex-col text-center text-sm text-muted-foreground">
            <p>Already have an account?</p>
            <Button variant="link" onClick={() => navigate("/signin")}>
              Sign in instead
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
