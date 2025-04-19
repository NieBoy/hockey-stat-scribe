
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

-- Create function to get game events (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_game_events(
  p_game_id UUID
)
RETURNS SETOF game_events
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.game_events
  WHERE game_id = p_game_id
  ORDER BY timestamp DESC;
END;
$$;

-- Create function to delete a game event (bypasses RLS)
CREATE OR REPLACE FUNCTION public.delete_game_event(
  p_event_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.game_events
  WHERE id = p_event_id;
  
  RETURN FOUND;
END;
$$;
