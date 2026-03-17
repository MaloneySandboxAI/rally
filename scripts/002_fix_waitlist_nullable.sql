-- Make challenger_email nullable since invite variant only captures friend email
ALTER TABLE waitlist ALTER COLUMN challenger_email DROP NOT NULL;
