
-- Create function to record a game stat (bypasses RLS)
-- This handles recording stats directly for team members
CREATE OR REPLACE FUNCTION public.record_game_stat(
  p_game_id UUID,
  p_player_id UUID,  -- This is now the team_member.id
  p_stat_type TEXT,
  p_period INTEGER,
  p_value INTEGER
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
  -- Validate that player_id exists in team_members
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE id = p_player_id) THEN
    RAISE EXCEPTION 'Invalid player_id: % - not found in team_members table', p_player_id;
  END IF;

  INSERT INTO public.game_stats (
    game_id,
    player_id,   -- This directly stores the team_member.id
    stat_type,
    period,
    value,
    timestamp
  )
  VALUES (
    p_game_id,
    p_player_id,
    p_stat_type,
    p_period,
    p_value,
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
