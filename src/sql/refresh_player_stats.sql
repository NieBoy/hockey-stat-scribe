
-- Function to refresh player stats from game_stats
CREATE OR REPLACE FUNCTION public.refresh_player_stats(player_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stat_type TEXT;
  stat_count INTEGER;
  games_count INTEGER;
  stat_record RECORD;
BEGIN
  -- First, log the function call for debugging
  RAISE NOTICE 'Refreshing stats for player %', player_id;

  -- Loop through distinct stat types for this player
  FOR stat_type IN (
    SELECT DISTINCT gs.stat_type 
    FROM game_stats gs
    WHERE gs.player_id = refresh_player_stats.player_id
  ) LOOP
    -- Count total value for this stat type and count distinct games
    SELECT 
      COALESCE(SUM(gs.value), 0) as total_value,
      COUNT(DISTINCT gs.game_id) as games_count
    INTO stat_count, games_count
    FROM game_stats gs
    WHERE 
      gs.player_id = refresh_player_stats.player_id AND
      gs.stat_type = stat_type;
      
    RAISE NOTICE 'Found stat type % with total value % across % games', 
      stat_type, stat_count, games_count;
      
    -- Check if stat already exists in player_stats
    SELECT * INTO stat_record
    FROM player_stats ps
    WHERE 
      ps.player_id = refresh_player_stats.player_id AND
      ps.stat_type = stat_type;
      
    IF FOUND THEN
      -- Update existing stat
      RAISE NOTICE 'Updating existing stat record for %', stat_type;
      
      UPDATE player_stats
      SET 
        value = stat_count,
        games_played = games_count,
        updated_at = now()
      WHERE id = stat_record.id;
    ELSE
      -- Insert new stat
      RAISE NOTICE 'Creating new stat record for %', stat_type;
      
      INSERT INTO player_stats (
        player_id,
        stat_type,
        value,
        games_played,
        created_at,
        updated_at
      ) VALUES (
        refresh_player_stats.player_id,
        stat_type,
        stat_count,
        games_count,
        now(),
        now()
      );
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$;
