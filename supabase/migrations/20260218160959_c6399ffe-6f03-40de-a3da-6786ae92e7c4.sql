
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Schemes table (public read)
CREATE TABLE public.schemes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  eligibility_criteria JSONB NOT NULL DEFAULT '{}',
  required_documents TEXT[] NOT NULL DEFAULT '{}',
  benefits TEXT NOT NULL,
  icon TEXT DEFAULT 'FileText',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Schemes are publicly readable" ON public.schemes FOR SELECT USING (true);

-- Wallet documents
CREATE TABLE public.wallet_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  file_path TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own docs" ON public.wallet_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own docs" ON public.wallet_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own docs" ON public.wallet_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own docs" ON public.wallet_documents FOR DELETE USING (auth.uid() = user_id);

-- Applications
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scheme_id UUID NOT NULL REFERENCES public.schemes(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','under_review','approved','rejected')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own apps" ON public.applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own apps" ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own apps" ON public.applications FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chats" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chats" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Seed schemes
INSERT INTO public.schemes (name, description, category, eligibility_criteria, required_documents, benefits, icon) VALUES
('PM Kisan Samman Nidhi', 'Direct income support of ₹6,000/year to small and marginal farmer families for agricultural needs.', 'Agriculture', '{"min_age": 18, "occupation": "farmer", "income_limit": 200000}', ARRAY['aadhaar_card', 'income_certificate', 'land_record'], '₹6,000 per year in 3 installments', 'Wheat'),
('Ayushman Bharat', 'Health insurance coverage of ₹5 lakh per family per year for secondary and tertiary care hospitalization.', 'Healthcare', '{"min_age": 0, "income_limit": 300000}', ARRAY['aadhaar_card', 'income_certificate', 'ration_card'], '₹5 lakh health insurance coverage', 'Heart'),
('PM Awas Yojana', 'Financial assistance for construction of pucca houses for eligible rural and urban poor families.', 'Housing', '{"min_age": 21, "income_limit": 300000, "housing_status": "homeless"}', ARRAY['aadhaar_card', 'income_certificate', 'address_proof'], 'Up to ₹2.5 lakh subsidy for housing', 'Home'),
('Sukanya Samriddhi Yojana', 'Savings scheme for the girl child with high interest rates and tax benefits under Section 80C.', 'Education', '{"min_age": 0, "max_age": 10, "gender": "female"}', ARRAY['aadhaar_card', 'birth_certificate'], '7.6% interest rate with tax benefits', 'GraduationCap'),
('PM Ujjwala Yojana', 'Free LPG connections to women from Below Poverty Line families for clean cooking fuel access.', 'Energy', '{"min_age": 18, "gender": "female", "income_limit": 100000}', ARRAY['aadhaar_card', 'bpl_card', 'ration_card'], 'Free LPG connection + first refill', 'Flame'),
('MGNREGA', 'Guaranteed 100 days of wage employment per year to rural households for unskilled manual work.', 'Employment', '{"min_age": 18, "location": "rural"}', ARRAY['aadhaar_card', 'job_card', 'address_proof'], '100 days guaranteed employment', 'Briefcase'),
('PM Mudra Yojana', 'Collateral-free loans up to ₹10 lakh for micro and small enterprises to promote entrepreneurship.', 'Business', '{"min_age": 18, "occupation": "self_employed"}', ARRAY['aadhaar_card', 'business_plan', 'address_proof'], 'Loans up to ₹10 lakh without collateral', 'TrendingUp'),
('National Scholarship Portal', 'Centralized platform for various scholarships for students from economically weaker sections.', 'Education', '{"min_age": 16, "max_age": 30, "income_limit": 250000}', ARRAY['aadhaar_card', 'income_certificate', 'marksheet'], 'Up to ₹50,000 scholarship per year', 'Award');
