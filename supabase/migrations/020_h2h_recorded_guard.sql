-- 020: Add h2h_recorded flag to challenges table to prevent duplicate h2h writes on page revisit
ALTER TABLE challenges ADD COLUMN IF NOT EXISTS h2h_recorded boolean NOT NULL DEFAULT false;
