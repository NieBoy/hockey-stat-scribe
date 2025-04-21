
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const SMTP_HOST = Deno.env.get("SMTP_HOST") || "smtp-relay.brevo.com";
const SMTP_PORT = parseInt(Deno.env.get("SMTP_PORT") || "587");
const SMTP_USERNAME = Deno.env.get("SMTP_USERNAME");
const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");
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
    if (!SMTP_USERNAME || !SMTP_PASSWORD) {
      throw new Error("Missing SMTP credentials");
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

    console.log(`Sending invitation email to ${to} via SMTP for team ${teamName} as ${role}`);
    console.log(`Signup URL: ${signupUrl}`);

    const client = new SmtpClient();

    // Connect to the SMTP server
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: SMTP_PORT,
      username: SMTP_USERNAME,
      password: SMTP_PASSWORD,
    });

    // Create HTML email content
    const htmlContent = `
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
    `;

    // Send the email
    await client.send({
      from: FROM_EMAIL,
      to: to,
      subject: `You've been invited to join ${teamName}`,
      content: "Please view this email in an HTML compatible email client",
      html: htmlContent,
    });

    // Close the connection
    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending invitation email via SMTP:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
