
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { DemoAccountForm } from "@/components/auth/DemoAccountForm";

export default function SignIn() {
  const [showDemoForm, setShowDemoForm] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-2">
            <PenTool className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign in to your account</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDemoForm ? (
            <LoginForm onShowDemoForm={() => setShowDemoForm(true)} />
          ) : (
            <DemoAccountForm onBackToSignIn={() => setShowDemoForm(false)} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
