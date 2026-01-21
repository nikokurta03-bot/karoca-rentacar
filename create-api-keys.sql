-- Create API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_name TEXT NOT NULL,
    key TEXT NOT NULL UNIQUE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users (admin) can do everything
CREATE POLICY "Authenticated users can manage api keys"
ON public.api_keys
FOR ALL
USING (auth.role() = 'authenticated');

-- Note: We don't need a public read policy because we check the key via server-side API routes,
-- which use the Supabase Service Role or a secure server-side client.
