
-- Create function to record a game stat (bypasses RLS)
-- This handles recording stats directly for team members
CREATE OR REPLACE FUNCTION public.record_game_stat(
  p_game_id UUID,
  p_player_id UUID,  -- This is now the team_member.id
  p_stat_type TEXT,
  p_period INTEGER,
  p_value INTEGER,
  p_details TEXT DEFAULT ''
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_stat_id UUID;
  result JSON;
BEGIN
  INSERT INTO public.game_stats (
    game_id,
    player_id,   -- This directly stores the team_member.id
    stat_type,
    period,
    value,
    details,
    timestamp
  )
  VALUES (
    p_game_id,
    p_player_id,
    p_stat_type,
    p_period,
    p_value,
    p_details,
    now()
  )
  RETURNING id INTO new_stat_id;
  
  SELECT json_build_object(
    'id', new_stat_id,
    'game_id', p_game_id,
    'player_id', p_player_id,
    'stat_type', p_stat_type,
    'period', p_period,
    'value', p_value
  ) INTO result;
  
  RETURN result;
END;
$$;
