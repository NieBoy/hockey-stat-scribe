
-- Function to refresh player stats from game_stats
CREATE OR REPLACE FUNCTION public.refresh_player_stats(player_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stat_type_val TEXT;
  stat_count INTEGER;
  games_count INTEGER;
  stat_record RECORD;
BEGIN
  -- First, log the function call for debugging
  RAISE NOTICE 'Refreshing stats for player %', player_id;

  -- Loop through distinct stat types for this player
  FOR stat_type_val IN (
    SELECT DISTINCT gs.stat_type 
    FROM game_stats gs
    WHERE gs.player_id = refresh_player_stats.player_id
  ) LOOP
    BEGIN
      -- Count total value for this stat type and count distinct games
      -- No special handling needed for plusMinus anymore - just sum the values
      SELECT 
        COALESCE(SUM(gs.value), 0) as total_value,
        COUNT(DISTINCT gs.game_id) as games_count
      INTO stat_count, games_count
      FROM game_stats gs
      WHERE 
        gs.player_id = refresh_player_stats.player_id AND
        gs.stat_type = stat_type_val;
          
      RAISE NOTICE 'Found stat type % with total value % across % games', 
        stat_type_val, stat_count, games_count;
        
      -- Check if stat already exists in player_stats
      SELECT * INTO stat_record
      FROM player_stats ps
      WHERE 
        ps.player_id = refresh_player_stats.player_id AND
        ps.stat_type = stat_type_val;
        
      IF FOUND THEN
        -- Update existing stat
        RAISE NOTICE 'Updating existing stat record for %', stat_type_val;
        
        UPDATE player_stats
        SET 
          value = stat_count,
          games_played = games_count,
          updated_at = now()
        WHERE id = stat_record.id;
      ELSE
        -- Insert new stat
        RAISE NOTICE 'Creating new stat record for %', stat_type_val;
        
        INSERT INTO player_stats (
          player_id,
          stat_type,
          value,
          games_played,
          created_at,
          updated_at
        ) VALUES (
          refresh_player_stats.player_id,
          stat_type_val,
          stat_count,
          games_count,
          now(),
          now()
        );
      END IF;

    EXCEPTION WHEN OTHERS THEN
      -- Catch any errors during processing this stat type and continue with others
      RAISE WARNING 'Error processing stat type %: %', stat_type_val, SQLERRM;
      -- Continue with next stat type
    END;
  END LOOP;
  
  RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
  -- Catch any general errors
  RAISE WARNING 'Error in refresh_player_stats: %', SQLERRM;
  RETURN FALSE;
END;
$$;
