
import { supabase } from "@/lib/supabase";
import { Organization, Team } from "@/types";

export const getOrganizations = async (): Promise<Organization[]> => {
  try {
    // Since there's no organizations table yet, we'll create a mock implementation
    // that returns the teams directly
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        organization_id
      `);
      
    if (error) throw error;
    
    // Group teams by organization_id
    const orgMap = new Map<string, Organization>();
    
    for (const team of data || []) {
      const orgId = team.organization_id || 'default';
      
      if (!orgMap.has(orgId)) {
        orgMap.set(orgId, {
          id: orgId,
          name: orgId === 'default' ? 'Default Organization' : `Organization ${orgId}`,
          teams: [],
          admins: []
        });
      }
      
      orgMap.get(orgId)?.teams.push({
        id: team.id,
        name: team.name,
        organizationId: orgId,
        players: [],
        coaches: [],
        parents: []
      });
    }
    
    return Array.from(orgMap.values());
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return [];
  }
};

export const getOrganizationById = async (id: string): Promise<Organization | null> => {
  try {
    // Since there's no organizations table yet, find all teams with this organization_id
    const { data, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        organization_id
      `)
      .eq('organization_id', id);
      
    if (error) return null;
    
    if (!data || data.length === 0) return null;
    
    return {
      id: id,
      name: `Organization ${id}`,
      teams: data.map(team => ({
        id: team.id,
        name: team.name,
        organizationId: team.organization_id || '',
        players: [],
        coaches: [],
        parents: []
      })),
      admins: []
    };
  } catch (error) {
    console.error("Error fetching organization:", error);
    return null;
  }
};

export const createOrganization = async (name: string): Promise<Organization | null> => {
  try {
    // For now, we'll create a team directly since organizations aren't implemented yet
    const { data, error } = await supabase
      .from('teams')
      .insert({ 
        name, 
        organization_id: crypto.randomUUID() // Create a unique organization ID
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.organization_id || '',
      name: name,
      teams: [{
        id: data.id,
        name: data.name,
        organizationId: data.organization_id || '',
        players: [],
        coaches: [],
        parents: []
      }],
      admins: []
    };
  } catch (error) {
    console.error("Error creating organization:", error);
    return null;
  }
};
