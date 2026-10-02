-- NULL links preserves fallback to the legacy website/social columns for existing cards.
-- An empty array means the user deliberately removed every link.
ALTER TABLE public.vcards
  ADD COLUMN address_line2 text,
  ADD COLUMN links jsonb CHECK (links IS NULL OR jsonb_typeof(links) = 'array');
