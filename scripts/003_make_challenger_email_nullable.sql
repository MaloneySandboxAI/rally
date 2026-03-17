-- Make challenger_email nullable to support referral variant where only friend_email is provided
ALTER TABLE waitlist ALTER COLUMN challenger_email DROP NOT NULL;
