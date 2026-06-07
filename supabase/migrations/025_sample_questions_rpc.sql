-- True random question sampling with exclusion list.
-- Replaces the .limit(20) + JS shuffle pattern that always returned
-- from the same 20-row window.
CREATE OR REPLACE FUNCTION sample_questions(
  p_category text,
  p_difficulty text,
  p_n int,
  p_exclude int[] DEFAULT '{}'
)
RETURNS SETOF sat_questions
LANGUAGE sql STABLE AS $$
  SELECT * FROM sat_questions
  WHERE category = p_category
    AND difficulty = p_difficulty
    AND id <> ALL (p_exclude)
  ORDER BY random()
  LIMIT p_n;
$$;
