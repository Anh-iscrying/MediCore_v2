ALTER TABLE public.specialties
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_specialties_is_active
ON public.specialties(is_active);
