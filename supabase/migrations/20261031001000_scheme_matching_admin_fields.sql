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
