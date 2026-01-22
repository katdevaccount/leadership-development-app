-- Migration: Add onboarding_copy table for coach customization
-- This table allows the coach to customize onboarding text globally

-- Create the onboarding_copy table
CREATE TABLE IF NOT EXISTS public.onboarding_copy (
    page_key TEXT PRIMARY KEY,  -- 'onboarding', 'job-role', 'company-info', 'welcome'
    copy_data JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL
);

-- Add comment to table
COMMENT ON TABLE public.onboarding_copy IS 'Stores custom onboarding copy text that can be edited by coaches';
COMMENT ON COLUMN public.onboarding_copy.page_key IS 'Unique identifier for the onboarding page (onboarding, job-role, company-info, welcome)';
COMMENT ON COLUMN public.onboarding_copy.copy_data IS 'JSON object containing customized copy fields';
COMMENT ON COLUMN public.onboarding_copy.updated_at IS 'Timestamp of last update';
COMMENT ON COLUMN public.onboarding_copy.updated_by IS 'User ID of the coach who last updated the copy';

-- Enable RLS
ALTER TABLE public.onboarding_copy ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read onboarding copy
CREATE POLICY "Anyone can read onboarding copy"
    ON public.onboarding_copy
    FOR SELECT
    USING (true);

-- Policy: Only coaches can insert/update/delete onboarding copy
CREATE POLICY "Coaches can insert onboarding copy"
    ON public.onboarding_copy
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'coach'
        )
    );

CREATE POLICY "Coaches can update onboarding copy"
    ON public.onboarding_copy
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'coach'
        )
    );

CREATE POLICY "Coaches can delete onboarding copy"
    ON public.onboarding_copy
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'coach'
        )
    );

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_copy_page_key ON public.onboarding_copy(page_key);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_onboarding_copy_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER onboarding_copy_updated_at
    BEFORE UPDATE ON public.onboarding_copy
    FOR EACH ROW
    EXECUTE FUNCTION update_onboarding_copy_timestamp();
