ALTER TABLE sat_questions
ADD COLUMN IF NOT EXISTS improvement_v2 jsonb;

CREATE INDEX IF NOT EXISTS sat_questions_v2_null_idx
  ON sat_questions ((improvement_v2 IS NULL));
CREATE INDEX IF NOT EXISTS sat_questions_v2_needs_review_idx
  ON sat_questions (((improvement_v2->>'needs_review')::boolean))
  WHERE improvement_v2 IS NOT NULL;
