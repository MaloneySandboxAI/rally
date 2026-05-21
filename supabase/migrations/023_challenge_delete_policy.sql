-- Fix: grant DELETE permission and add RLS policies so cancel/delete features work.
-- Migration 005 intentionally blocked all client-side deletes — now adding scoped policies.

GRANT DELETE ON challenges TO authenticated;

-- Creators can cancel their own pending challenges
CREATE POLICY "Creators can delete own pending challenges"
  ON challenges FOR DELETE
  USING (creator_id = auth.uid() AND status = 'pending');

-- Either participant can clear a completed challenge from their view
CREATE POLICY "Participants can delete completed challenges"
  ON challenges FOR DELETE
  USING (
    status = 'completed'
    AND (creator_id = auth.uid() OR challenger_id = auth.uid())
  );
