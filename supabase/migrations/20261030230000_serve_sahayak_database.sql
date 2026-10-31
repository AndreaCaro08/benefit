CREATE TABLE IF NOT EXISTS public.scheme_catalog (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ta TEXT,
  description TEXT,
  description_ta TEXT,
  benefits TEXT,
  benefits_ta TEXT,
  category TEXT,
  department TEXT,
  government_level TEXT,
  state TEXT,
  eligibility_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  application_url TEXT,
  verification_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (verification_status IN ('draft', 'pending_admin_verification', 'published')),
  last_verified_at DATE,
  translation_status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (translation_status IN ('verified', 'unverified')),
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (NOT is_published OR verification_status = 'published')
);

ALTER TABLE public.scheme_catalog
  ADD COLUMN IF NOT EXISTS description_ta TEXT,
  ADD COLUMN IF NOT EXISTS benefits_ta TEXT,
  ADD COLUMN IF NOT EXISTS application_url TEXT;

ALTER TABLE public.scheme_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Scheme records are visible with their publication status"
  ON public.scheme_catalog;
CREATE POLICY "Scheme records are visible with their publication status"
  ON public.scheme_catalog FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Serve Sahayak admins can manage scheme records"
  ON public.scheme_catalog;
CREATE POLICY "Serve Sahayak admins can manage scheme records"
  ON public.scheme_catalog FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
GRANT SELECT ON public.scheme_catalog TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.scheme_catalog TO authenticated;

DROP POLICY IF EXISTS "Schemes are publicly readable" ON public.schemes;
CREATE POLICY "Serve Sahayak admins can review legacy schemes"
  ON public.schemes FOR ALL TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

INSERT INTO public.scheme_catalog AS existing (
  slug, name, name_ta, description, description_ta, benefits, benefits_ta,
  category, department, government_level, state, eligibility_rules,
  required_documents, source_urls, verification_status, last_verified_at,
  translation_status, is_published
) VALUES
  ('pudhumai-penn', 'Pudhumai Penn Scheme', 'புதுமைப் பெண் திட்டம் (Tamil translation unverified)', NULL, NULL, NULL, NULL, 'Education', NULL, 'State', 'Tamil Nadu', '[]'::jsonb, '{}', ARRAY['https://www.tnsocialwelfare.tn.gov.in/en', 'https://www.tn.gov.in/'], 'draft', NULL, 'unverified', FALSE),
  ('tamil-pudhalvan', 'Tamil Pudhalvan Scheme', 'தமிழ் புதல்வன் திட்டம் (Tamil translation unverified)', NULL, NULL, NULL, NULL, 'Education', NULL, 'State', 'Tamil Nadu', '[]'::jsonb, '{}', ARRAY['https://www.tn.gov.in/'], 'draft', NULL, 'unverified', FALSE),
  ('pm-kisan', 'PM-KISAN', 'பி.எம்.-கிசான் (Tamil transliteration unverified)', NULL, NULL, NULL, NULL, 'Agriculture', NULL, 'Central', 'All India', '[]'::jsonb, '{}', ARRAY['https://pmkisan.gov.in/'], 'draft', NULL, 'unverified', FALSE),
  ('ayushman-bharat-pm-jay', 'Ayushman Bharat PM-JAY', 'ஆயுஷ்மான் பாரத் PM-JAY (Tamil transliteration unverified)', NULL, NULL, NULL, NULL, 'Healthcare', NULL, 'Central', 'All India', '[]'::jsonb, '{}', ARRAY['https://nha.gov.in/'], 'draft', NULL, 'unverified', FALSE),
  ('kalaignar-magalir-urimai-thogai', 'Kalaignar Magalir Urimai Thogai', 'கலைஞர் மகளிர் உரிமைத் தொகை (Tamil title unverified)', NULL, NULL, NULL, NULL, 'Women & Child Welfare', NULL, 'State', 'Tamil Nadu', '[]'::jsonb, '{}', ARRAY['https://www.tn.gov.in/', 'https://www.tnsocialwelfare.tn.gov.in/en'], 'draft', NULL, 'unverified', FALSE),
  ('nsp-pm-yasasvi', 'PM YASASVI - Central Sector Scheme of Top Class Education in Schools for OBC, EBC and DNT Students', NULL, NULL, NULL, NULL, NULL, 'Scholarship', NULL, 'Central', 'All India', '[]'::jsonb, '{}', ARRAY['https://scholarships.gov.in/'], 'draft', NULL, 'unverified', FALSE),
  ('nsp-csss', 'PM-USP - Central Sector Scheme of Scholarship for College and University Students (CSSS) (Merit Based Scheme)', NULL, NULL, NULL, NULL, NULL, 'Scholarship', NULL, 'Central', 'All India', '[]'::jsonb, '{}', ARRAY['https://scholarships.gov.in/'], 'draft', NULL, 'unverified', FALSE),
  ('nsp-jk-ladakh-special-scholarship', 'PM-USP Special Scholarship Scheme for Jammu, Kashmir and Ladakh (Merit Based Scheme)', NULL, NULL, NULL, NULL, NULL, 'Scholarship', NULL, 'Central', 'Jammu & Kashmir and Ladakh', '[]'::jsonb, '{}', ARRAY['https://scholarships.gov.in/'], 'draft', NULL, 'unverified', FALSE),
  ('pmay-u-2-0', 'PMAY-U 2.0', 'பி.எம்.ஏ.ஒய்-யூ 2.0 (Tamil transliteration unverified)', NULL, NULL, NULL, NULL, 'Housing', NULL, 'Central', 'All India', '[]'::jsonb, '{}', ARRAY['https://pmay-urban.gov.in/'], 'draft', NULL, 'unverified', FALSE),
  ('nsap', 'National Social Assistance Programme (NSAP)', 'தேசிய சமூக உதவித் திட்டம் (Tamil translation unverified)', NULL, NULL, NULL, NULL, 'Social Welfare', NULL, 'Central', 'All India', '[]'::jsonb, '{}', ARRAY['https://nsap.nic.in/'], 'draft', NULL, 'unverified', FALSE)
ON CONFLICT (slug) DO UPDATE SET
  name = CASE WHEN existing.is_published THEN existing.name ELSE EXCLUDED.name END,
  name_ta = CASE WHEN existing.is_published THEN existing.name_ta ELSE EXCLUDED.name_ta END,
  description = CASE WHEN existing.is_published THEN existing.description ELSE NULL END,
  description_ta = CASE WHEN existing.is_published THEN existing.description_ta ELSE NULL END,
  benefits = CASE WHEN existing.is_published THEN existing.benefits ELSE NULL END,
  benefits_ta = CASE WHEN existing.is_published THEN existing.benefits_ta ELSE NULL END,
  category = CASE WHEN existing.is_published THEN existing.category ELSE EXCLUDED.category END,
  department = CASE WHEN existing.is_published THEN existing.department ELSE NULL END,
  government_level = CASE WHEN existing.is_published THEN existing.government_level ELSE EXCLUDED.government_level END,
  state = CASE WHEN existing.is_published THEN existing.state ELSE EXCLUDED.state END,
  eligibility_rules = CASE WHEN existing.is_published THEN existing.eligibility_rules ELSE '[]'::jsonb END,
  required_documents = CASE WHEN existing.is_published THEN existing.required_documents ELSE '{}' END,
  source_urls = CASE WHEN existing.is_published THEN existing.source_urls ELSE EXCLUDED.source_urls END,
  application_url = CASE WHEN existing.is_published THEN existing.application_url ELSE NULL END,
  verification_status = CASE WHEN existing.is_published THEN existing.verification_status ELSE 'draft' END,
  last_verified_at = CASE WHEN existing.is_published THEN existing.last_verified_at ELSE NULL END,
  translation_status = CASE WHEN existing.is_published THEN existing.translation_status ELSE 'unverified' END,
  is_published = existing.is_published;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS household_type TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS age SMALLINT,
  ADD COLUMN IF NOT EXISTS annual_income NUMERIC(12, 2),
  ADD COLUMN IF NOT EXISTS has_disability BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS public.serve_wallet_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, document_type),
  UNIQUE (storage_path)
);

ALTER TABLE public.serve_wallet_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own Serve Sahayak documents"
  ON public.serve_wallet_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add own Serve Sahayak documents"
  ON public.serve_wallet_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own Serve Sahayak documents"
  ON public.serve_wallet_documents FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own Serve Sahayak documents"
  ON public.serve_wallet_documents FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.serve_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_slug TEXT NOT NULL REFERENCES public.scheme_catalog(slug),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  readiness_percent SMALLINT CHECK (readiness_percent BETWEEN 0 AND 100),
  status_note TEXT NOT NULL DEFAULT 'Saved to the private tracker; no government application was submitted.',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.serve_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own Serve Sahayak applications"
  ON public.serve_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Serve Sahayak admins can view applications"
  ON public.serve_applications FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
CREATE POLICY "Users can submit own Serve Sahayak applications"
  ON public.serve_applications FOR INSERT WITH CHECK (
    auth.uid() = user_id AND status = 'pending'
  );
CREATE POLICY "Serve Sahayak admins can update application status"
  ON public.serve_applications FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE OR REPLACE FUNCTION public.set_serve_sahayak_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_scheme_catalog_updated_at
  BEFORE UPDATE ON public.scheme_catalog
  FOR EACH ROW EXECUTE FUNCTION public.set_serve_sahayak_updated_at();
CREATE TRIGGER set_serve_applications_updated_at
  BEFORE UPDATE ON public.serve_applications
  FOR EACH ROW EXECUTE FUNCTION public.set_serve_sahayak_updated_at();
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_serve_sahayak_updated_at();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'serve_applications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.serve_applications;
  END IF;
END;
$$;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'serve-sahayak-documents',
  'serve-sahayak-documents',
  FALSE,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png'];

CREATE POLICY "Users can upload own Serve Sahayak files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'serve-sahayak-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users can read own Serve Sahayak files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'serve-sahayak-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users can update own Serve Sahayak files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'serve-sahayak-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'serve-sahayak-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
CREATE POLICY "Users can delete own Serve Sahayak files"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'serve-sahayak-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
