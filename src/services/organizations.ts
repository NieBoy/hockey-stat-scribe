
import { supabase } from "@/lib/supabase";
import { Organization, Team } from "@/types";

export const getOrganizations = async (): Promise<Organization[]> => {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      teams:teams(id, name)
    `);

  if (error) throw error;
  
  return data.map(org => ({
    id: org.id,
    name: org.name,
    teams: org.teams.map(team => ({
      id: team.id,
      name: team.name,
      organizationId: org.id,
      players: [],
      coaches: [],
      parents: []
    })) || [],
    admins: [] // We'll fetch admins in a separate query if needed
  }));
};

export const getOrganizationById = async (id: string): Promise<Organization | null> => {
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      teams:teams(id, name)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  
  return {
    id: data.id,
    name: data.name,
    teams: data.teams.map(team => ({
      id: team.id,
      name: team.name,
      organizationId: data.id,
      players: [],
      coaches: [],
      parents: []
    })) || [],
    admins: [] // We'll fetch admins in a separate query if needed
  };
};

export const createOrganization = async (name: string): Promise<Organization | null> => {
  const { data, error } = await supabase
    .from('organizations')
    .insert({ name })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    teams: [],
    admins: []
  };
};
