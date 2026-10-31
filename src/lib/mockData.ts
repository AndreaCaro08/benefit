export type EligibilityRule = {
  field: string;
  operator: 'equals' | 'in' | 'exists' | 'unknown' | 'gte' | 'lte';
  value: string;
  source_url: string;
  required?: boolean;
};

export type Scheme = {
  id: string;
  name: string;
  name_ta: string;
  description: string;
  description_ta: string;
  category: string;
  benefits: string;
  benefits_ta: string;
  icon: string;
  government_level: string;
  state: string;
  department: string;
  eligibility_criteria: string[];
  eligibility_rules: EligibilityRule[];
  required_documents: string[];
  official_link: string;
  application_url?: string | null;
  source: string;
  source_url: string;
  source_urls: string[];
  verification_status: 'draft' | 'pending_admin_verification' | 'published';
  last_verified_at: string | null;
  is_published: boolean;
  translation_status: 'verified' | 'unverified';
};

export type WalletDoc = {
  id: string;
  document_type: string;
  document_name: string;
  uploaded_at: string;
  file_path: string | null;
  user_id?: string;
};

export const MAX_WALLET_DOCUMENTS = 6;

export type UserProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  preferred_language: string;
  state: string;
  district: string;
  household_type: 'student' | 'family' | 'farmer' | 'senior' | 'working' | 'unknown';
  gender: 'female' | 'male' | 'other' | 'unknown';
  age: number;
  annual_income: number;
  has_disability: boolean | null;
};

export type SchemeMatch = {
  eligibilityScore: number | null;
  documentMatchScore: number | null;
  documentEligibilityScore: number | null;
  readinessScore: number | null;
  isPrototypeDocumentMatch: boolean;
  matchedCriteria: EligibilityCheck[];
  failedCriteria: EligibilityCheck[];
  unknownCriteria: EligibilityCheck[];
  requiredDocuments: DocumentCheck[];
  missingDocuments: string[];
  status:
    | 'strong_potential_match'
    | 'more_information_required'
    | 'documents_pending'
    | 'eligibility_criteria_not_met'
    | 'ready_for_next_step';
};

export type EligibilityCheck = {
  field: string;
  operator: EligibilityRule['operator'];
  value: string;
  required: boolean;
  source_url: string;
};

export type DocumentCheck = {
  id: string;
  status: 'uploaded_pending_verification' | 'missing';
};

const PROTOTYPE_REQUIRED_DOCUMENTS: Record<string, string[]> = {
  'pudhumai-penn': ['aadhaar_card', 'marksheet', 'student_id', 'bank_account_details'],
  'tamil-pudhalvan': ['aadhaar_card', 'marksheet', 'student_id', 'bank_account_details'],
  'pm-kisan': ['aadhaar_card', 'land_record', 'bank_account_details'],
  'ayushman-bharat-pm-jay': ['aadhaar_card', 'ration_card', 'address_proof'],
  'kalaignar-magalir-urimai-thogai': ['aadhaar_card', 'ration_card', 'bank_account_details', 'income_certificate'],
  'nsp-pm-yasasvi': ['aadhaar_card', 'marksheet', 'student_id', 'income_certificate', 'caste_certificate'],
  'nsp-csss': ['aadhaar_card', 'marksheet', 'student_id', 'income_certificate', 'bank_account_details'],
  'nsp-jk-ladakh-special-scholarship': ['aadhaar_card', 'marksheet', 'student_id', 'income_certificate', 'caste_certificate'],
  'pmay-u-2-0': ['aadhaar_card', 'address_proof', 'income_certificate', 'bank_account_details'],
  nsap: ['aadhaar_card', 'birth_certificate', 'income_certificate', 'bank_account_details'],
};

const DEFAULT_SCHEMES: Scheme[] = [
  {
    id: 'pudhumai-penn',
    name: 'Pudhumai Penn Scheme',
    name_ta: 'புதுமைப் பெண் திட்டம் (Tamil title pending verification)',
    description:
      'Draft scheme seed. This record is intentionally marked as unpublished pending authorized verification and publication by an admin.',
    description_ta:
      'வரைவு திட்டப் பதிவு. இந்தப் பதிவு அதிகாரப்பூர்வ சரிபார்ப்பு மற்றும் வெளியீடு வரை வெளியிடப்படாது.',
    category: 'Education',
    benefits:
      'Benefit details are not yet verified for publication. Use official Tamil Nadu Social Welfare source pages for the latest approved benefits.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. சமீபத்திய அங்கீகரிக்கப்பட்ட நன்மைகளுக்கு அதிகாரப்பூர்வ தமிழ்நாடு சமூக நல ஆதாரங்களைப் பார்க்கவும்.',
    icon: 'GraduationCap',
    government_level: 'State',
    state: 'Tamil Nadu',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility criteria are still under admin verification and are not yet published.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://www.tnsocialwelfare.tn.gov.in/en',
    source: 'Government of Tamil Nadu / Department of Social Welfare',
    source_url: 'https://www.tnsocialwelfare.tn.gov.in/en',
    source_urls: ['https://www.tnsocialwelfare.tn.gov.in/en', 'https://www.tn.gov.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'tamil-pudhalvan',
    name: 'Tamil Pudhalvan Scheme',
    name_ta: 'தமிழ் புதல்வன் திட்டம் (Tamil title pending verification)',
    description:
      'Draft scheme seed. This record is intentionally marked as unpublished pending authorized verification and publication by an admin.',
    description_ta:
      'வரைவு திட்டப் பதிவு. இந்தப் பதிவு அதிகாரப்பூர்வ சரிபார்ப்பு மற்றும் வெளியீடு வரை வெளியிடப்படாது.',
    category: 'Education',
    benefits:
      'Official benefit details are not yet verified for publication. Use the Tamil Nadu government portal for the latest approved scheme description.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. சமீபத்திய அங்கீகரிக்கப்பட்ட திட்ட விளக்கத்திற்கு தமிழ்நாடு அரசின் அதிகாரப்பூர்வ இணையதளத்தைப் பயன்படுத்தவும்.',
    icon: 'Briefcase',
    government_level: 'State',
    state: 'Tamil Nadu',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility criteria are still under admin verification and are not yet published.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://www.tn.gov.in/',
    source: 'Government of Tamil Nadu',
    source_url: 'https://www.tn.gov.in/',
    source_urls: ['https://www.tn.gov.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'pm-kisan',
    name: 'PM-KISAN',
    name_ta: 'பி.எம்.-கிசான் (Tamil title pending verification)',
    description:
      'Draft scheme seed. Central Government data is included only where confirmed on the official PM-KISAN portal. Full benefits and document rules remain under verification.',
    description_ta:
      'வரைவு திட்டப் பதிவு. மத்திய அரசின் PM-KISAN இணையதளத்தில் உறுதிப்படுத்தப்பட்ட விவரங்கள் மட்டுமே சேர்க்கப்படுகின்றன. முழுமையான நன்மைகள் மற்றும் ஆவண விதிகள் இன்னும் சரிபார்க்கப்படுகின்றன.',
    category: 'Agriculture',
    benefits:
      'Benefit details are not yet verified for publication. Official PM-KISAN notices should be used for the latest approved scheme information.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. சமீபத்திய அங்கீகரிக்கப்பட்ட தகவலுக்கு அதிகாரப்பூர்வ PM-KISAN அறிவிப்புகளைப் பயன்படுத்தவும்.',
    icon: 'Wheat',
    government_level: 'Central',
    state: 'All India',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility details are unknown pending admin verification against the official scheme rules.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://pmkisan.gov.in/',
    source: 'Government of India / PM-KISAN',
    source_url: 'https://pmkisan.gov.in/',
    source_urls: ['https://pmkisan.gov.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'ayushman-bharat-pm-jay',
    name: 'Ayushman Bharat PM-JAY',
    name_ta: 'ஆயுஷ்மான் பாரத் PM-JAY (Tamil title pending verification)',
    description:
      'Draft scheme seed. This record reflects only the scheme name and official government source and deliberately omits unverified benefit and document details.',
    description_ta:
      'வரைவு திட்டப் பதிவு. இத்திட்டம் அதிகாரப்பூர்வ அரசுத் தளத்தின் பெயர் மற்றும் ஆதாரத்தை மட்டுமே குறிக்கிறது; உறுதிப்படுத்தப்படாத நன்மை மற்றும் ஆவண விவரங்கள் தவிர்க்கப்பட்டுள்ளன.',
    category: 'Healthcare',
    benefits:
      'Benefit details are unpublished until a verified admin review is completed. Use the official PM-JAY and NHM source pages for current approved benefits.',
    benefits_ta:
      'நன்மை விவரங்கள் அங்கீகரிக்கப்பட்ட நிர்வாக சரிபார்ப்புக்கு முன்பாக வெளியிடப்படவில்லை. தற்போதைய அங்கீகரிக்கப்பட்ட நன்மைகள் தொடர்பாக அதிகாரப்பூர்வ PM-JAY மற்றும் NHM ஆதாரங்களைப் பயன்படுத்தவும்.',
    icon: 'Heart',
    government_level: 'Central',
    state: 'All India',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility is documented only at the official scheme source and remains pending admin verification in this seed set.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://pmjay.gov.in/',
    source: 'Government of India / PM-JAY',
    source_url: 'https://pmjay.gov.in/',
    source_urls: ['https://pmjay.gov.in/', 'https://nhm.gov.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'kalaignar-magalir-urimai-thogai',
    name: 'Kalaignar Magalir Urimai Thogai',
    name_ta: 'கலைஞர் மகளிர் உரிமை தொகை (Tamil title pending verification)',
    description:
      'Draft scheme seed. This entry is intentionally limited to the official scheme name and department context until an authorized admin validates the full policy record.',
    description_ta:
      'வரைவு திட்டப் பதிவு. அதிகாரப்பூர்வ நிர்வாகம் முழுமையான கொள்கை பதிவை சரிபார்க்கும் வரை, திட்டத்தின் பெயர் மற்றும் துறை மட்டுமே இடப்பட்டுள்ளது.',
    category: 'Women & Child Welfare',
    benefits:
      'Benefit details are not yet verified for publication. Use the Tamil Nadu government source pages for authorized scheme information.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. அங்கீகரிக்கப்பட்ட திட்டத் தகவலுக்கு தமிழ்நாடு அரசின் அதிகாரப்பூர்வ ஆதாரங்களைப் பயன்படுத்தவும்.',
    icon: 'Users',
    government_level: 'State',
    state: 'Tamil Nadu',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility criteria remain pending admin verification and are intentionally not published in this draft seed.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://www.tn.gov.in/',
    source: 'Government of Tamil Nadu',
    source_url: 'https://www.tn.gov.in/',
    source_urls: ['https://www.tn.gov.in/', 'https://www.tnsocialwelfare.tn.gov.in/en'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'nsp-pm-yasasvi',
    name: 'PM YASASVI - Central Sector Scheme of Top Class Education in Schools for OBC, EBC and DNT Students',
    name_ta: 'பி.எம். யசஸ்வி - உயர்நிலைப் பள்ளிகளில் உச்ச வகுப்பு கல்வி (Tamil title pending verification)',
    description:
      'Draft seed for a National Scholarship Portal scheme. This record is kept intentionally limited to the official portal name and source until an authorized admin verifies full scheme details.',
    description_ta:
      'தேசிய உதவித்தொகை போர்ட்டலின் வரைவு பதிவாகும். அதிகாரப்பூர்வ நிர்வாகம் முழுமையான திட்ட விவரங்களைச் சரிபார்க்கும் வரை, போர்ட்டல் பெயர் மற்றும் ஆதாரம் மட்டுமே சேர்க்கப்பட்டுள்ளது.',
    category: 'Scholarship',
    benefits:
      'Official benefit details are not yet verified for publication. Use the National Scholarship Portal for the latest approved scholarship terms.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. சமீபத்திய அங்கீகரிக்கப்பட்ட உதவித்தொகை விதிகளுக்கு தேசிய உதவித்தொகை போர்ட்டலைப் பயன்படுத்தவும்.',
    icon: 'GraduationCap',
    government_level: 'Central',
    state: 'All India',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility details are intentionally omitted until this draft is reviewed and verified by an authorized admin.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://scholarships.gov.in/',
    source: 'National Scholarship Portal',
    source_url: 'https://scholarships.gov.in/',
    source_urls: ['https://scholarships.gov.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'nsp-csss',
    name: 'PM-USP - Central Sector Scheme of Scholarship for College and University Students (CSSS) (Merit Based Scheme)',
    name_ta: 'பி.எம்.-யுஎஸ்பி – கல்லூரி மற்றும் பல்கலைக்கழக மாணவர்களுக்கான மத்திய துறை உதவித்தொகை (Tamil title pending verification)',
    description:
      'Draft seed for a National Scholarship Portal scheme. This record is intentionally limited to official portal identification until authorized verification is complete.',
    description_ta:
      'தேசிய உதவித்தொகை போர்ட்டலின் வரைவு பதிவாகும். அங்கீகரிக்கப்பட்ட சரிபார்ப்பு முடியும் வரை அதிகாரப்பூர்வ போர்ட்டல் அடையாளம் மட்டுமே இங்கே பட்டியலிடப்பட்டுள்ளது.',
    category: 'Scholarship',
    benefits:
      'Benefit details are not yet verified for publication. Use the National Scholarship Portal for current scholarship terms and eligibility conditions.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. தற்போதைய உதவித்தொகை விதிமுறைகள் மற்றும் தகுதி நிபந்தனைகளுக்கு தேசிய உதவித்தொகை போர்ட்டலைப் பயன்படுத்தவும்.',
    icon: 'GraduationCap',
    government_level: 'Central',
    state: 'All India',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility details are intentionally omitted until this draft is reviewed and verified by an authorized admin.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://scholarships.gov.in/',
    source: 'National Scholarship Portal',
    source_url: 'https://scholarships.gov.in/',
    source_urls: ['https://scholarships.gov.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'nsp-jk-ladakh-special-scholarship',
    name: 'PM-USP Special Scholarship Scheme for Jammu, Kashmir and Ladakh (Merit Based Scheme)',
    name_ta: 'ஜம்மு & காஷ்மீர் மற்றும் லடாக் சிறப்பு உதவித்தொகை திட்டம் (Tamil title pending verification)',
    description:
      'Draft seed for a National Scholarship Portal scheme. This record is intentionally limited to official portal identification until authorized verification is complete.',
    description_ta:
      'தேசிய உதவித்தொகை போர்ட்டலின் வரைவு பதிவாகும். அங்கீகரிக்கப்பட்ட சரிபார்ப்பு முடியும் வரை அதிகாரப்பூர்வ போர்ட்டல் அடையாளம் மட்டுமே இதில் குறிப்பிடப்பட்டுள்ளது.',
    category: 'Scholarship',
    benefits:
      'Benefit details are not yet verified for publication. Use the National Scholarship Portal for current scholarship terms and eligibility conditions.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. தற்போதைய உதவித்தொகை விதிமுறைகள் மற்றும் தகுதி நிபந்தனைகளுக்கு தேசிய உதவித்தொகை போர்ட்டலைப் பயன்படுத்தவும்.',
    icon: 'GraduationCap',
    government_level: 'Central',
    state: 'Jammu & Kashmir and Ladakh',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility details are intentionally omitted until this draft is reviewed and verified by an authorized admin.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://scholarships.gov.in/',
    source: 'National Scholarship Portal',
    source_url: 'https://scholarships.gov.in/',
    source_urls: ['https://scholarships.gov.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'pmay-u-2-0',
    name: 'PMAY-U 2.0',
    name_ta: 'பி.எம்.ஏ.ஒய்-யூ 2.0 (Tamil title pending verification)',
    description:
      'Draft scheme seed. This entry reflects only the verified official housing scheme name and Ministry portal source; all benefit details remain intentionally unpublished pending admin verification.',
    description_ta:
      'வரைவு திட்டப் பதிவு. இதன் உள்ளடக்கம் அதிகாரப்பூர்வ வீட்டு வசதி திட்டத்தின் பெயர் மற்றும் அமைச்சக ஆதாரத்தை மட்டுமே குறிக்கிறது; முழுமையான நன்மை விவரங்கள் நிர்வாக சரிபார்ப்பு வரை வெளியிடப்படாது.',
    category: 'Housing',
    benefits:
      'Benefit details are not yet verified for publication. Use the official PMAY-U portal for the latest approved housing scheme details.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. சமீபத்திய அங்கீகரிக்கப்பட்ட வீட்டு வசதி விவரங்களுக்கு அதிகாரப்பூர்வ PMAY-U போர்ட்டலைப் பயன்படுத்தவும்.',
    icon: 'Home',
    government_level: 'Central',
    state: 'All India',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility and document details remain under admin verification and are intentionally not published in this draft.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://pmay-urban.gov.in/',
    source: 'Ministry of Housing and Urban Affairs',
    source_url: 'https://pmay-urban.gov.in/',
    source_urls: ['https://pmay-urban.gov.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
  {
    id: 'nsap',
    name: 'National Social Assistance Programme (NSAP)',
    name_ta: 'தேசிய சமூக உதவி திட்டம் (NSAP) (Tamil title pending verification)',
    description:
      'Draft scheme seed. This record is intentionally kept limited to known official programme identity and source until an authorized admin publishes the verified rule set.',
    description_ta:
      'வரைவு திட்டப் பதிவு. அங்கீகரிக்கப்பட்ட விதிகளின் முழுமையான தொகுப்பு வெளியிடப்படும் வரை, வழங்கப்பட்டுள்ள தகவல் திட்டத்தின் அடையாளம் மற்றும் ஆதாரத்துடன் மட்டுமே கட்டுப்படுத்தப்பட்டுள்ளது.',
    category: 'Social Welfare',
    benefits:
      'Benefit details are not yet verified for publication. Use the official NSAP source pages for the current approved assistance information.',
    benefits_ta:
      'நன்மை விவரங்கள் இன்னும் சரிபார்க்கப்படவில்லை. தற்போதைய அங்கீகரிக்கப்பட்ட உதவி விவரங்களுக்கு அதிகாரப்பூர்வ NSAP ஆதாரத்தைப் பயன்படுத்தவும்.',
    icon: 'ShieldCheck',
    government_level: 'Central',
    state: 'All India',
    department: 'Unknown pending verification',
    eligibility_criteria: [
      'Eligibility criteria remain under admin verification and are intentionally not published in this draft.',
    ],
    eligibility_rules: [],
    required_documents: [],
    official_link: 'https://nsap.nic.in/',
    application_url: null,
    source: 'Government of India / NSAP',
    source_url: 'https://nsap.nic.in/',
    source_urls: ['https://nsap.nic.in/'],
    verification_status: 'draft',
    last_verified_at: null,
    is_published: false,
    translation_status: 'unverified',
  },
];

const readJson = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

export const getSchemes = (): Scheme[] => {
  const savedSchemes = readJson<Scheme[] | null>('serve_sahayak_schemes_v2', null);
  return Array.isArray(savedSchemes) ? savedSchemes : DEFAULT_SCHEMES;
};
export const saveSchemes = (schemes: Scheme[]) => writeJson('serve_sahayak_schemes_v2', schemes);

export const getWalletDocuments = (): WalletDoc[] =>
  readJson<WalletDoc[]>('bb_wallet_docs', []).filter((document) => Boolean(document.file_path && !document.file_path.startsWith('digilocker:')));
export const saveWalletDocuments = (docs: WalletDoc[]) => writeJson('bb_wallet_docs', docs);

const DEFAULT_PROFILE: UserProfile = {
  id: 'demo-user',
  full_name: 'Citizen',
  email: '',
  phone: '',
  preferred_language: 'en',
  state: '',
  district: '',
  household_type: 'unknown',
  gender: 'unknown',
  age: 0,
  annual_income: 0,
  has_disability: null,
};
export const getProfile = (): UserProfile => {
  const saved = readJson<Partial<UserProfile>>('bb_profile', {});
  return {
    ...DEFAULT_PROFILE,
    ...saved,
    phone: saved.phone || '',
    state: saved.state || '',
    district: saved.district || '',
    household_type: saved.household_type || 'unknown',
    gender: saved.gender || 'unknown',
    age: saved.age || 0,
    annual_income: saved.annual_income || 0,
    has_disability: saved.has_disability ?? null,
  };
};
export const saveProfile = (profile: UserProfile) => writeJson('bb_profile', profile);

export const getUserName = () => getProfile().full_name || 'Citizen';
export const getLocalWalletDocSet = (): Set<string> => new Set(getWalletDocuments().map((doc) => doc.document_type));

const supportedProfileFields = new Set([
  'age',
  'annual_income',
  'district',
  'gender',
  'has_disability',
  'household_type',
  'state',
]);

const profileValue = (profile: UserProfile, field: string): string | number | boolean | null => {
  if (!supportedProfileFields.has(field)) return null;
  const value = profile[field as keyof UserProfile];
  if (typeof value === 'string') return value.trim() && value !== 'unknown' ? value.trim() : null;
  if (typeof value === 'number') return value > 0 ? value : null;
  if (typeof value === 'boolean') return field === 'has_disability' ? value : null;
  return null;
};

export const evaluateSchemeMatch = (
  scheme: Scheme,
  profile: UserProfile,
  walletDocs: string[],
): SchemeMatch => {
  const isVerified = scheme.is_published
    && scheme.verification_status === 'published'
    && Boolean(scheme.last_verified_at);
  const isPrototypeDocumentMatch = !isVerified && Boolean(
    scheme.required_documents.length || PROTOTYPE_REQUIRED_DOCUMENTS[scheme.id]?.length,
  );
  const documentsForMatch = isVerified
    ? scheme.required_documents
    : isPrototypeDocumentMatch
      ? scheme.required_documents.length
        ? scheme.required_documents
        : PROTOTYPE_REQUIRED_DOCUMENTS[scheme.id]
      : [];
  if (!isVerified && !isPrototypeDocumentMatch) {
    return {
      eligibilityScore: null,
      documentMatchScore: null,
      documentEligibilityScore: null,
      readinessScore: null,
      isPrototypeDocumentMatch: false,
      matchedCriteria: [],
      missingDocuments: [],
      failedCriteria: [],
      unknownCriteria: [],
      requiredDocuments: [],
      status: 'more_information_required',
    };
  }

  const matchedCriteria: EligibilityCheck[] = [];
  const failedCriteria: EligibilityCheck[] = [];
  const unknownCriteria: EligibilityCheck[] = [];
  let mandatoryFailure = false;
  let mandatoryUnknown = false;

  for (const rule of isVerified ? scheme.eligibility_rules : []) {
    const actual = profileValue(profile, rule.field);
    const required = rule.required !== false;
    let matches: boolean | null = null;

    if (rule.operator === 'unknown' || actual === null) {
      matches = null;
    } else if (rule.operator === 'exists') {
      matches = true;
    } else if (rule.operator === 'equals') {
      matches = String(actual).toLocaleLowerCase() === rule.value.toLocaleLowerCase();
    } else if (rule.operator === 'in') {
      matches = rule.value.split('|').some((value) => value.trim().toLocaleLowerCase() === String(actual).toLocaleLowerCase());
    } else if (rule.operator === 'gte' || rule.operator === 'lte') {
      const actualNumber = Number(actual);
      const targetNumber = Number(rule.value);
      matches = Number.isFinite(actualNumber) && Number.isFinite(targetNumber)
        ? rule.operator === 'gte' ? actualNumber >= targetNumber : actualNumber <= targetNumber
        : null;
    }

    const check: EligibilityCheck = {
      field: rule.field,
      operator: rule.operator,
      value: rule.value,
      required,
      source_url: rule.source_url,
    };
    if (matches === true) {
      matchedCriteria.push(check);
    } else if (matches === false) {
      failedCriteria.push(check);
      if (required) mandatoryFailure = true;
    } else {
      unknownCriteria.push(check);
      if (required) mandatoryUnknown = true;
    }
  }

  const requiredDocuments: DocumentCheck[] = documentsForMatch.map((id) => ({
    id,
    status: walletDocs.includes(id) ? 'uploaded_pending_verification' : 'missing',
  }));
  const missingDocuments = requiredDocuments
    .filter((document) => document.status === 'missing')
    .map((document) => document.id);
  const uploadedDocuments = requiredDocuments.length - missingDocuments.length;
  const totalReadinessChecks = scheme.eligibility_rules.length + requiredDocuments.length;
  const eligibilityScore = isVerified && scheme.eligibility_rules.length > 0
    ? Math.round((matchedCriteria.length / scheme.eligibility_rules.length) * 100)
    : null;
  const documentMatchScore = requiredDocuments.length > 0
    ? Math.round((uploadedDocuments / requiredDocuments.length) * 100)
    : null;
  const documentEligibilityScore = documentMatchScore === null
    ? null
    : Math.round((documentMatchScore / 100) * 80);
  const readinessScore = isVerified && totalReadinessChecks > 0
    ? Math.round(((matchedCriteria.length + uploadedDocuments) / totalReadinessChecks) * 100)
    : null;
  const hasUnknownCriteria = !isVerified || mandatoryUnknown || scheme.eligibility_rules.length === 0;
  const status: SchemeMatch['status'] = mandatoryFailure
    ? 'eligibility_criteria_not_met'
    : hasUnknownCriteria
      ? 'more_information_required'
      : missingDocuments.length > 0
        ? 'documents_pending'
        : failedCriteria.length === 0 && unknownCriteria.length === 0
          ? 'ready_for_next_step'
          : eligibilityScore !== null && eligibilityScore >= 80
            ? 'strong_potential_match'
            : 'eligibility_criteria_not_met';

  return {
    eligibilityScore,
    documentMatchScore,
    documentEligibilityScore,
    readinessScore,
    isPrototypeDocumentMatch,
    matchedCriteria,
    missingDocuments,
    requiredDocuments,
    failedCriteria,
    unknownCriteria,
    status,
  };
};
