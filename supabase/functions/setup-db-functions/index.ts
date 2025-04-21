
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const body = await req.json();
    const action = body?.action || "setup_all";

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    let result;

    if (action === "setup_check_table_function" || action === "setup_all") {
      // Create function to check if a table exists
      result = await supabaseAdmin.rpc('exec_sql', {
        sql_string: `
          CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
          RETURNS boolean
          LANGUAGE plpgsql
          AS $$
          DECLARE
            table_exists boolean;
          BEGIN
            SELECT EXISTS (
              SELECT FROM information_schema.tables 
              WHERE table_schema = 'public'
              AND table_name = $1
            ) INTO table_exists;
            RETURN table_exists;
          END;
          $$;
          
          CREATE OR REPLACE FUNCTION create_or_update_check_table_exists_function()
          RETURNS boolean
          LANGUAGE plpgsql
          AS $$
          BEGIN
            RETURN true;
          END;
          $$;
        `
      });
    }

    if (action === "setup_invitations_table_function" || action === "setup_all") {
      // Create function to create the invitations table
      result = await supabaseAdmin.rpc('exec_sql', {
        sql_string: `
          CREATE OR REPLACE FUNCTION create_invitations_table()
          RETURNS boolean
          LANGUAGE plpgsql
          AS $$
          BEGIN
            CREATE TABLE IF NOT EXISTS public.invitations (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              team_id UUID NOT NULL,
              email TEXT NOT NULL,
              status TEXT NOT NULL DEFAULT 'pending',
              created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
              expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
              user_id UUID,
              accepted_at TIMESTAMP WITH TIME ZONE
            );
            RETURN true;
          END;
          $$;
          
          CREATE OR REPLACE FUNCTION create_or_update_invitations_table_function()
          RETURNS boolean
          LANGUAGE plpgsql
          AS $$
          BEGIN
            RETURN true;
          END;
          $$;
          
          CREATE OR REPLACE FUNCTION exec_sql(sql_string text) 
          RETURNS text 
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_string;
            RETURN 'SQL executed successfully';
          EXCEPTION WHEN OTHERS THEN
            RETURN 'Error: ' || SQLERRM;
          END;
          $$;
        `
      });
    }

    return new Response(
      JSON.stringify({ message: "Database functions set up successfully", result }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: 500,
      }
    );
  }
});
