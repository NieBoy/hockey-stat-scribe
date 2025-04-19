
-- Create function to create a game event (bypasses RLS)
CREATE OR REPLACE FUNCTION public.create_game_event(
  p_game_id UUID,
  p_event_type TEXT,
  p_period INTEGER,
  p_team_type TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_event_id UUID;
  result JSON;
BEGIN
  -- Create a new game event
  INSERT INTO public.game_events (
    game_id,
    event_type,
    period,
    team_type,
    timestamp
  )
  VALUES (
    p_game_id,
    p_event_type,
    p_period,
    p_team_type,
    now()
  )
  RETURNING id INTO new_event_id;
  
  -- Return the full event data
  SELECT json_build_object(
    'id', new_event_id,
    'game_id', p_game_id,
    'event_type', p_event_type,
    'period', p_period,
    'team_type', p_team_type
  ) INTO result;
  
  RETURN result;
END;
$$;

-- Function to record a stat for a player
CREATE OR REPLACE FUNCTION public.record_player_stat(
  p_game_id UUID,
  p_player_id UUID,
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
    player_id,
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
