
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
  -- Loop through distinct stat types for this player
  FOR stat_type IN (
    SELECT DISTINCT stat_type 
    FROM game_stats 
    WHERE player_id = refresh_player_stats.player_id
  ) LOOP
    -- Count total value for this stat type
    SELECT 
      COALESCE(SUM(value), 0) as total_value,
      COUNT(DISTINCT game_id) as games_count
    INTO stat_count, games_count
    FROM game_stats
    WHERE 
      player_id = refresh_player_stats.player_id AND
      stat_type = stat_type;
      
    -- Check if stat already exists in player_stats
    SELECT * INTO stat_record
    FROM player_stats
    WHERE 
      player_id = refresh_player_stats.player_id AND
      stat_type = stat_type;
      
    IF FOUND THEN
      -- Update existing stat
      UPDATE player_stats
      SET 
        value = stat_count,
        games_played = games_count
      WHERE id = stat_record.id;
    ELSE
      -- Insert new stat
      INSERT INTO player_stats (
        player_id,
        stat_type,
        value,
        games_played
      ) VALUES (
        refresh_player_stats.player_id,
        stat_type,
        stat_count,
        games_count
      );
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$;
