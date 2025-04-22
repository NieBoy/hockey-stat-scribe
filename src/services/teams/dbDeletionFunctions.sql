
-- Function to delete team player-parent relationships
CREATE OR REPLACE FUNCTION public.delete_team_relationships(team_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM player_parents
  WHERE player_id IN (
    SELECT id FROM team_members WHERE team_id = team_id_param
  )
  OR parent_id IN (
    SELECT id FROM team_members WHERE team_id = team_id_param
  );
END;
$$;

-- Function to delete team game data
CREATE OR REPLACE FUNCTION public.delete_team_game_data(team_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  game_ids UUID[];
BEGIN
  -- Find games associated with this team
  SELECT array_agg(id) INTO game_ids FROM games
  WHERE home_team_id = team_id_param OR away_team_id = team_id_param;
  
  -- If there are games, delete related data
  IF game_ids IS NOT NULL AND array_length(game_ids, 1) > 0 THEN
    -- Delete stat trackers
    DELETE FROM stat_trackers WHERE game_id = ANY(game_ids);
    
    -- Delete game stats
    DELETE FROM game_stats WHERE game_id = ANY(game_ids);
    
    -- Delete event players
    DELETE FROM event_players WHERE event_id IN (
      SELECT id FROM game_events WHERE game_id = ANY(game_ids)
    );
    
    -- Delete game events
    DELETE FROM game_events WHERE game_id = ANY(game_ids);
    
    -- Delete games
    DELETE FROM games WHERE id = ANY(game_ids);
  END IF;
END;
$$;

-- Function to delete team player stats
CREATE OR REPLACE FUNCTION public.delete_team_player_stats(team_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM player_stats
  WHERE player_id IN (
    SELECT DISTINCT user_id FROM team_members 
    WHERE team_id = team_id_param AND user_id IS NOT NULL
  );
END;
$$;

-- Function to delete team members
CREATE OR REPLACE FUNCTION public.delete_team_members(team_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM team_members WHERE team_id = team_id_param;
END;
$$;
