-- Identify duplicate questions by normalized stem.
-- If duplicates exist, log them to a view rather than forcing a unique
-- constraint that would fail on existing data.

CREATE OR REPLACE VIEW duplicate_questions AS
SELECT
  lower(btrim(question)) AS normalized_stem,
  category,
  difficulty,
  array_agg(id ORDER BY id) AS duplicate_ids,
  count(*) AS cnt
FROM sat_questions
GROUP BY lower(btrim(question)), category, difficulty
HAVING count(*) > 1;
