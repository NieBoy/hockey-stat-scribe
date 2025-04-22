
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateDemoUserRequest {
  email: string;
  password: string;
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    // This allows us to bypass RLS and perform admin actions
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { email, password, name }: CreateDemoUserRequest = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return new Response(
        JSON.stringify({
          error: "Email, password, and name are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Creating demo user: ${email}`);

    // Create user with admin privileges (bypasses email confirmation)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // This bypasses the email confirmation
      user_metadata: { name },
    });

    if (error) {
      console.error("Error creating user:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If user created successfully, also create a user profile
    if (data.user) {
      const { error: profileError } = await supabaseAdmin
        .from("users")
        .insert({
          id: data.user.id,
          name: name,
          email: email,
        });

      if (profileError) {
        console.error("Error creating user profile:", profileError);
      }

      // Add default user role
      const { error: roleError } = await supabaseAdmin
        .from("user_roles")
        .insert({
          user_id: data.user.id,
          role: "player",
        });

      if (roleError) {
        console.error("Error adding user role:", roleError);
      }
    }

    return new Response(
      JSON.stringify({
        user: data.user,
        message: "Demo user created successfully with email pre-confirmed",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error in create-demo-user function:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
