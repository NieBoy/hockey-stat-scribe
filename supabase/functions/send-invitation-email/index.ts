
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// Brevo does not have a deno-compatible SDK, so use fetch with their REST API.

const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@yourdomain.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailParams {
  to: string;
  teamName: string;
  invitationId: string;
  role: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!BREVO_API_KEY) {
      throw new Error("Missing Brevo API Key");
    }

    // Parse request body
    const { to, teamName, invitationId, role } = await req.json() as EmailParams;

    if (!to || !teamName || !invitationId) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate sign-up URL with invitation ID
    const signupUrl = `${new URL(req.url).origin.replace('functions', 'app')}/accept-invitation?id=${invitationId}`;

    console.log(`Sending invitation email to ${to} with Brevo for team ${teamName} as ${role}`);
    console.log(`Signup URL: ${signupUrl}`);

    // Construct Brevo's API payload.
    // Brevo API: https://api.brevo.com/v3/smtp/email
    const brevoPayload = {
      sender: { email: FROM_EMAIL, name: teamName },
      to: [{ email: to }],
      subject: `You've been invited to join ${teamName}`,
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Team Invitation</h2>
          <p>You've been invited to join <strong>${teamName}</strong> as a <strong>${role}</strong>.</p>
          <p>Click the button below to accept this invitation and create your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${signupUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If you didn't expect this invitation, you can ignore this email.</p>
        </div>
      `,
    };

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify(brevoPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Brevo API error:", errorData);
      throw new Error(`Brevo API error: ${response.status} ${errorData}`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending invitation email with Brevo:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
