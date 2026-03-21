export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

export const documentTypes = [
  { id: 'aadhaar_card', label: 'Aadhaar Card', description: 'Unique identification number', issuer: 'UIDAI, Government of India' },
  { id: 'income_certificate', label: 'Income Certificate', description: 'Proof of annual income', issuer: 'Revenue Department' },
  { id: 'address_proof', label: 'Address Proof', description: 'Residence verification document', issuer: 'Various Government Bodies' },
  { id: 'ration_card', label: 'Ration Card', description: 'Public distribution system card', issuer: 'Food & Civil Supplies Department' },
  { id: 'birth_certificate', label: 'Birth Certificate', description: 'Date of birth proof', issuer: 'Municipal Corporation' },
  { id: 'land_record', label: 'Land Record', description: 'Agricultural land ownership proof', issuer: 'Revenue Department' },
  { id: 'bpl_card', label: 'BPL Card', description: 'Below Poverty Line certification', issuer: 'State Government' },
  { id: 'job_card', label: 'Job Card (MGNREGA)', description: 'Employment guarantee card', issuer: 'Ministry of Rural Development' },
  { id: 'business_plan', label: 'Business Plan', description: 'Business proposal document', issuer: 'Self-Prepared' },
  { id: 'marksheet', label: 'Marksheet', description: 'Academic records / transcripts', issuer: 'Education Board' },
  { id: 'caste_certificate', label: 'Caste Certificate', description: 'SC/ST/OBC category proof', issuer: 'Revenue Department' },
  { id: 'disability_certificate', label: 'Disability Certificate', description: 'Certificate for persons with disabilities', issuer: 'District Medical Board' },
];
