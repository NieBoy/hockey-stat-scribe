
import { supabase } from '@/lib/supabase';

export async function validatePlayerId(playerId: string): Promise<boolean> {
  const { count } = await supabase
    .from('team_members')
    .select('id', { count: 'exact', head: true })
    .eq('id', playerId);
    
  if (!count) {
    console.error(`Invalid player ID: ${playerId}`);
    return false;
  }
  
  return true;
}

export async function validatePlayers(scorerId?: string, primaryAssistId?: string, secondaryAssistId?: string): Promise<boolean> {
  try {
    // Validate scorer if provided
    if (scorerId && !(await validatePlayerId(scorerId))) {
      throw new Error(`Player with ID ${scorerId} does not exist`);
    }
    
    // Validate primary assist if provided
    if (primaryAssistId && !(await validatePlayerId(primaryAssistId))) {
      throw new Error(`Player with ID ${primaryAssistId} does not exist`);
    }
    
    // Validate secondary assist if provided
    if (secondaryAssistId && !(await validatePlayerId(secondaryAssistId))) {
      throw new Error(`Player with ID ${secondaryAssistId} does not exist`);
    }
    
    return true;
  } catch (error) {
    throw error;
  }
}
