-- Tested against local PostgreSQL, including the live schema differences. Requires its vehicle,
-- booking, promo-code and API-key additions. No data is deleted.
-- Assign app_metadata.role = 'admin' through a trusted Supabase admin before rollout.
BEGIN;
-- Private recovery snapshot, outside the public API schema. Existing backup name
-- intentionally causes a rollback rather than silently overwriting an earlier copy.
CREATE SCHEMA karoca_backup_20260916;
REVOKE ALL ON SCHEMA karoca_backup_20260916 FROM PUBLIC, anon, authenticated;
CREATE TABLE karoca_backup_20260916.policies AS SELECT * FROM pg_policies WHERE schemaname='public';
CREATE TABLE karoca_backup_20260916.grants AS SELECT * FROM information_schema.role_table_grants WHERE table_schema='public';
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['vehicles','bookings','contact_messages','promo_codes','api_keys','customers','invoices'] LOOP
    IF to_regclass(format('public.%I',t)) IS NOT NULL THEN
      EXECUTE format('CREATE TABLE karoca_backup_20260916.%I AS TABLE public.%I',t,t);
    END IF;
  END LOOP;
END $$;
REVOKE ALL ON ALL TABLES IN SCHEMA karoca_backup_20260916 FROM PUBLIC, anon, authenticated;
CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS model_year integer;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS vehicle_status text DEFAULT 'Spreman';
ALTER TABLE public.vehicles ADD CONSTRAINT vehicle_rate_positive CHECK (price_per_day > 0) NOT VALID;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS request_id uuid UNIQUE;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS request_fingerprint text;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS selected_extras text[] DEFAULT '{}';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS extra_notes text DEFAULT '';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS deposit_confirmed boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS border_crossing boolean DEFAULT false;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cleaning_fee boolean DEFAULT false;
ALTER TABLE public.bookings ADD CONSTRAINT booking_date_order CHECK (return_date > pickup_date) NOT VALID;
ALTER TABLE public.bookings ADD CONSTRAINT booking_price_positive CHECK (total_price > 0) NOT VALID;
-- Deliberately fails/rolls back if old confirmed bookings overlap: resolve them first.
ALTER TABLE public.bookings ADD CONSTRAINT confirmed_booking_no_overlap
EXCLUDE USING gist (vehicle_id WITH =, daterange(pickup_date, return_date, '[)') WITH &&)
WHERE (status = 'confirmed');

-- Replace permissive policies rather than adding restrictive-looking policies next
-- to old permissive ones. Only trusted app_metadata grants staff access.
DO $$ DECLARE r record; t text; BEGIN
  FOREACH t IN ARRAY ARRAY['vehicles','bookings','contact_messages','promo_codes','api_keys','customers','invoices'] LOOP
    IF to_regclass(format('public.%I', t)) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR r IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
      EXECUTE format('DROP POLICY %I ON public.%I', r.policyname, t);
    END LOOP;
    EXECUTE format('CREATE POLICY staff_access ON public.%I FOR ALL TO authenticated USING ((auth.jwt()->''app_metadata''->>''role'') = ''admin'') WITH CHECK ((auth.jwt()->''app_metadata''->>''role'') = ''admin'')', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM PUBLIC, anon, authenticated', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.public_vehicle_catalog(start_on date DEFAULT NULL, end_on date DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
BEGIN
 IF (start_on IS NULL) <> (end_on IS NULL) OR end_on <= start_on OR end_on - start_on > 365 THEN
   RAISE EXCEPTION 'Invalid dates';
 END IF;
 RETURN COALESCE((SELECT jsonb_agg(item ORDER BY price) FROM (
   SELECT jsonb_build_object('id',v.id,'name',v.name,'category',v.category,'image_url',v.image_url,
     'price_per_day',v.price_per_day,'model_year',v.model_year,'seats',v.seats,'transmission',v.transmission,
     'fuel_type',v.fuel_type,'features',v.features,'rating',v.rating,'available',v.available) AS item,
     v.price_per_day AS price
   FROM public.vehicles v WHERE v.available = true AND COALESCE(v.vehicle_status,'Spreman') <> 'Servis'
   AND (start_on IS NULL OR NOT EXISTS (SELECT 1 FROM public.bookings b WHERE b.vehicle_id = v.id
     AND b.status = 'confirmed' AND b.pickup_date < end_on AND b.return_date > start_on))
 ) catalog), '[]'::jsonb);
END $$;
REVOKE ALL ON FUNCTION public.public_vehicle_catalog(date,date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_vehicle_catalog(date,date) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_booking(payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
 v public.vehicles%ROWTYPE; p public.promo_codes%ROWTYPE; existing public.bookings%ROWTYPE;
 start_on date := (payload->>'pickup_date')::date; end_on date := (payload->>'return_date')::date;
 rid uuid := (payload->>'request_id')::uuid; vid uuid := (payload->>'vehicle_id')::uuid;
 extras text[]; daily_extras numeric := 0; discount numeric := 0; total numeric; bid uuid;
BEGIN
 IF rid IS NULL OR vid IS NULL OR start_on IS NULL OR end_on IS NULL OR
   start_on < DATE '2027-04-01' OR start_on < (now() AT TIME ZONE 'Europe/Zagreb')::date OR end_on - start_on NOT BETWEEN 1 AND 365 OR
   length(trim(COALESCE(payload->>'customer_name',''))) NOT BETWEEN 1 AND 255 OR
   length(COALESCE(payload->>'customer_email','')) NOT BETWEEN 3 AND 255 OR
   COALESCE(payload->>'customer_email','') !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR
   length(trim(COALESCE(payload->>'customer_phone',''))) NOT BETWEEN 1 AND 255 OR
   COALESCE(payload->>'pickup_location','') NOT IN ('Zadar - Zračna luka','Zadar - Centar','Zadar - Autobusni kolodvor') OR
   COALESCE(payload->>'deposit_confirmed','false') <> 'true' OR length(COALESCE(payload->>'extra_notes','')) > 2000 THEN
   RAISE EXCEPTION 'Invalid booking';
 END IF;
 -- Serialize retries of the same submission, and never expose another request.
 PERFORM pg_advisory_xact_lock(hashtextextended(rid::text, 0));
 SELECT * INTO existing FROM public.bookings WHERE request_id = rid;
 IF FOUND THEN
   IF existing.request_fingerprint IS DISTINCT FROM md5(payload::text) THEN RAISE EXCEPTION 'Invalid request'; END IF;
   RETURN jsonb_build_object('id',existing.id,'total_price',existing.total_price,'replayed',true);
 END IF;
 SELECT * INTO v FROM public.vehicles WHERE id = vid AND available = true AND COALESCE(vehicle_status,'Spreman') <> 'Servis' FOR UPDATE;
 IF NOT FOUND OR v.price_per_day <= 0 THEN RAISE EXCEPTION 'Vehicle unavailable'; END IF;
 IF EXISTS (SELECT 1 FROM public.bookings b WHERE b.vehicle_id=vid AND b.status='confirmed'
   AND b.pickup_date < end_on AND b.return_date > start_on) THEN RAISE EXCEPTION 'Vehicle unavailable'; END IF;
 SELECT COALESCE(array_agg(value),'{}') INTO extras FROM jsonb_array_elements_text(payload->'selected_extras');
 IF extras @> ARRAY['border_eu','border_noneu'] THEN RAISE EXCEPTION 'Choose one border option'; END IF;
 IF cardinality(extras) <> (SELECT count(DISTINCT x) FROM unnest(extras) x) OR
   NOT extras <@ ARRAY['cdw','glass','infant','child','booster','border_eu','border_noneu','cleaning','gps'] THEN RAISE EXCEPTION 'Invalid extras'; END IF;
 SELECT COALESCE(sum(CASE x WHEN 'cdw' THEN 15 WHEN 'glass' THEN 8 WHEN 'infant' THEN 10 WHEN 'child' THEN 10 WHEN 'booster' THEN 5 WHEN 'border_eu' THEN 50 WHEN 'border_noneu' THEN 100 WHEN 'cleaning' THEN 15 WHEN 'gps' THEN 5 END),0) INTO daily_extras FROM unnest(extras) x;
 IF length(trim(COALESCE(payload->>'promo_code',''))) > 0 THEN
   SELECT * INTO p FROM public.promo_codes WHERE upper(code) = upper(trim(payload->>'promo_code')) AND active = true FOR UPDATE;
   IF NOT FOUND OR (p.valid_until IS NOT NULL AND p.valid_until < (now() AT TIME ZONE 'Europe/Zagreb')::date)
     OR (p.uses_remaining IS NOT NULL AND p.uses_remaining <= 0) OR p.discount_percent NOT BETWEEN 0 AND 100 THEN RAISE EXCEPTION 'Invalid promo'; END IF;
   discount := p.discount_percent;
   UPDATE public.promo_codes SET uses_remaining = uses_remaining - 1 WHERE id=p.id AND uses_remaining IS NOT NULL;
 END IF;
 total := round((v.price_per_day + daily_extras) * (end_on-start_on) * (1-discount/100),2);
 INSERT INTO public.bookings (request_id,request_fingerprint,vehicle_id,customer_name,customer_email,customer_phone,pickup_location,pickup_date,return_date,total_price,status,selected_extras,extra_notes,deposit_confirmed,border_crossing,cleaning_fee)
 VALUES (rid,md5(payload::text),vid,trim(payload->>'customer_name'),trim(payload->>'customer_email'),trim(payload->>'customer_phone'),payload->>'pickup_location',start_on,end_on,total,'pending',extras,COALESCE(payload->>'extra_notes',''),true,extras && ARRAY['border_eu','border_noneu'],'cleaning'=ANY(extras)) RETURNING id INTO bid;
 RETURN jsonb_build_object('id',bid,'total_price',total,'vehicle_name',v.name,'replayed',false);
END $$;
REVOKE ALL ON FUNCTION public.submit_booking(jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_booking(jsonb) TO service_role;
COMMIT;
