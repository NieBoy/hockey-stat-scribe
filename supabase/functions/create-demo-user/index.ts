
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
  teamMemberId?: string; // Optional team member ID to link
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
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

    const { email, password, name, teamMemberId }: CreateDemoUserRequest = await req.json();

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

    console.log(`Creating or finding user account: ${email}`);

    // First check if the user already exists
    const { data: existingUser, error: lookupError } = await supabaseAdmin.auth.admin.getUserByEmail(email);

    if (lookupError && lookupError.message !== "User not found") {
      console.error("Error checking existing user:", lookupError);
      return new Response(
        JSON.stringify({
          error: lookupError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let userId;

    if (existingUser) {
      // User already exists, just return the user
      console.log(`User ${email} already exists, skipping creation`);
      userId = existingUser.id;
      
      // If the user exists but doesn't have a profile, create it
      const { data: existingProfile } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", userId)
        .maybeSingle();

      if (!existingProfile) {
        const { error: profileError } = await supabaseAdmin
          .from("users")
          .insert({
            id: userId,
            name: name,
            email: email,
          });

        if (profileError) {
          console.error("Error creating user profile for existing user:", profileError);
        }
      }

      // Check if the user has a role assigned
      const { data: existingRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingRole) {
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .insert({
            user_id: userId,
            role: "player",
          });

        if (roleError) {
          console.error("Error adding user role for existing user:", roleError);
        }
      }
    } else {
      // Create a new user if they don't exist
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // This explicitly confirms the email
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
        userId = data.user.id;
        
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
    }

    // If a team member ID was provided, link this user to the team member
    if (teamMemberId && userId) {
      console.log(`Linking user ${userId} to team member ${teamMemberId}`);
      
      const { error: linkError } = await supabaseAdmin
        .from("team_members")
        .update({ user_id: userId })
        .eq("id", teamMemberId);
        
      if (linkError) {
        console.error("Error linking user to team member:", linkError);
        // We don't fail the entire request if this fails - the user is still created
      } else {
        console.log(`Successfully linked user ${userId} to team member ${teamMemberId}`);
      }
    }

    return new Response(
      JSON.stringify({
        user: existingUser || (userId ? { id: userId } : null),
        message: existingUser 
          ? "User already exists and can be used to sign in" 
          : "Demo user created successfully with email pre-confirmed",
        alreadyExists: !!existingUser,
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
