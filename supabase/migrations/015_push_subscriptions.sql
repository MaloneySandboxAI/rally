-- Push notification subscriptions (Web Push API)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own subscription"
  ON push_subscriptions FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Service role can read all subscriptions"
  ON push_subscriptions FOR SELECT
  USING (true);
