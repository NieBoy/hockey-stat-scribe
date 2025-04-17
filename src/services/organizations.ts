import { supabase } from "@/lib/supabase";
import { Team } from "@/types";

// This file is kept for compatibility but functionality is removed
// We're keeping empty implementations to prevent breaking changes

export const getOrganizations = async (): Promise<any[]> => {
  console.log("Organizations feature has been removed");
  return [];
};

export const getOrganizationById = async (id: string): Promise<any | null> => {
  console.log("Organizations feature has been removed");
  return null;
};

export const createOrganization = async (name: string): Promise<any | null> => {
  console.log("Organizations feature has been removed");
  return null;
};
