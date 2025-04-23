
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

export async function validatePlayer(playerId: string): Promise<void> {
  if (!(await validatePlayerId(playerId))) {
    throw new Error(`Player with ID ${playerId} does not exist`);
  }
}
