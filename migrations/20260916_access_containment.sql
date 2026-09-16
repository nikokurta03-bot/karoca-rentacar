-- Narrow existing access only; no data, credentials or role assignments change.
-- Separate from the booking rollout so exposed tables can be protected immediately.
BEGIN;
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['api_keys','promo_codes','bookings','customers','invoices'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon', t);
    EXECUTE format('REVOKE TRUNCATE, REFERENCES, TRIGGER ON public.%I FROM authenticated', t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='require_trusted_admin') THEN
      EXECUTE format('CREATE POLICY require_trusted_admin ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((auth.jwt()->''app_metadata''->>''role'') = ''admin'') WITH CHECK ((auth.jwt()->''app_metadata''->>''role'') = ''admin'')', t);
    END IF;
  END LOOP;
END $$;
COMMIT;
