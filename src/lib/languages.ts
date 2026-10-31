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
  { id: 'aadhaar_card', label: 'Aadhaar Card', labelTa: 'ஆதார் அட்டை', description: 'Unique identification number', issuer: 'UIDAI, Government of India' },
  { id: 'income_certificate', label: 'Income Certificate', labelTa: 'வருமானச் சான்றிதழ்', description: 'Proof of annual income', issuer: 'Revenue Department' },
  { id: 'address_proof', label: 'Address Proof', labelTa: 'முகவரிச் சான்று', description: 'Residence verification document', issuer: 'Various Government Bodies' },
  { id: 'ration_card', label: 'Ration Card', labelTa: 'குடும்ப அட்டை', description: 'Public distribution system card', issuer: 'Food & Civil Supplies Department' },
  { id: 'birth_certificate', label: 'Birth Certificate', labelTa: 'பிறப்புச் சான்றிதழ்', description: 'Date of birth proof', issuer: 'Municipal Corporation' },
  { id: 'land_record', label: 'Land Record', labelTa: 'நில ஆவணம்', description: 'Agricultural land ownership proof', issuer: 'Revenue Department' },
  { id: 'bpl_card', label: 'BPL Card', labelTa: 'வறுமைக் கோட்டுக்குக் கீழ் உள்ளோர் அட்டை', description: 'Below Poverty Line certification', issuer: 'State Government' },
  { id: 'job_card', label: 'Job Card (MGNREGA)', labelTa: 'வேலை அட்டை (MGNREGA)', description: 'Employment guarantee card', issuer: 'Ministry of Rural Development' },
  { id: 'bank_account_details', label: 'Bank Account Details', labelTa: 'வங்கிக் கணக்கு விவரங்கள்', description: 'Bank account and IFSC confirmation', issuer: 'Scheduled Bank / Post Office' },
  { id: 'business_plan', label: 'Business Plan', labelTa: 'தொழில் திட்டம்', description: 'Business proposal document', issuer: 'Self-Prepared' },
  { id: 'marksheet', label: 'Marksheet', labelTa: 'மதிப்பெண் சான்றிதழ்', description: 'Academic records / transcripts', issuer: 'Education Board' },
  { id: 'student_id', label: 'Student ID / Enrollment Certificate', labelTa: 'மாணவர் அடையாள அட்டை / சேர்க்கைச் சான்றிதழ்', description: 'Current student identity proof', issuer: 'Educational Institution' },
  { id: 'caste_certificate', label: 'Caste Certificate', labelTa: 'சாதிச் சான்றிதழ்', description: 'SC/ST/OBC category proof', issuer: 'Revenue Department' },
  { id: 'disability_certificate', label: 'Disability Certificate', labelTa: 'மாற்றுத்திறனாளி சான்றிதழ்', description: 'Certificate for persons with disabilities', issuer: 'District Medical Board' },
  { id: 'medical_certificate', label: 'Medical Certificate', labelTa: 'மருத்துவச் சான்றிதழ்', description: 'Treatment or health verification record', issuer: 'Government Hospital / Medical Board' },
];
