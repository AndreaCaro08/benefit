import { describe, expect, it } from 'vitest';
import { evaluateSchemeMatch, getProfile, getSchemes, type Scheme, type UserProfile } from './mockData';

const createScheme = (overrides: Partial<Scheme> = {}): Scheme => ({
  id: 'verified-scheme',
  name: 'Verified scheme',
  name_ta: '',
  description: '',
  description_ta: '',
  category: 'Education',
  benefits: '',
  benefits_ta: '',
  icon: 'FileText',
  government_level: 'Central',
  state: 'All India',
  department: '',
  eligibility_criteria: [],
  eligibility_rules: [],
  required_documents: ['aadhaar_card', 'marksheet'],
  official_link: '',
  source: '',
  source_url: '',
  source_urls: [],
  verification_status: 'published',
  last_verified_at: '2026-10-30',
  is_published: true,
  translation_status: 'unverified',
  ...overrides,
});

describe('evaluateSchemeMatch', () => {
  const profile: UserProfile = {
    ...getProfile(),
    age: 24,
    annual_income: 200000,
    state: 'Tamil Nadu',
    district: 'Chennai',
    gender: 'other',
  };

  it('does not present a match score for draft schemes', () => {
    const result = evaluateSchemeMatch(createScheme({
      verification_status: 'draft',
      is_published: false,
    }), profile, ['aadhaar_card']);
    expect(result.eligibilityScore).toBeNull();
    expect(result.documentMatchScore).toBe(50);
    expect(result.documentEligibilityScore).toBe(40);
    expect(result.requiredDocuments).toHaveLength(2);
    expect(result.missingDocuments).toEqual(['marksheet']);
    expect(result.readinessScore).toBeNull();
    expect(result.isPrototypeDocumentMatch).toBe(true);
    expect(result.status).toBe('more_information_required');
  });

  it('does not treat an empty verified rule set as a full match', () => {
    const result = evaluateSchemeMatch(createScheme({ required_documents: [] }), profile, []);
    expect(result.eligibilityScore).toBeNull();
    expect(result.readinessScore).toBeNull();
    expect(result.status).toBe('more_information_required');
  });

  it('calculates a source-backed score and lists missing documents', () => {
    const scheme = createScheme({
      required_documents: ['aadhaar_card'],
      eligibility_rules: [{
        field: 'age',
        operator: 'gte',
        value: '18',
        source_url: 'https://official.gov.in/scheme',
      }],
    });

    const result = evaluateSchemeMatch(scheme, profile, []);
    expect(result.eligibilityScore).toBe(100);
    expect(result.documentMatchScore).toBe(0);
    expect(result.documentEligibilityScore).toBe(0);
    expect(result.readinessScore).toBe(50);
    expect(result.missingDocuments).toEqual(['aadhaar_card']);
    expect(result.status).toBe('documents_pending');
    expect(result.matchedCriteria).toHaveLength(1);
    expect(result.requiredDocuments[0].status).toBe('missing');
  });

  it('keeps unknown profile values unresolved and does not invent a score', () => {
    const scheme = createScheme({
      required_documents: [],
      eligibility_rules: [{
        field: 'state',
        operator: 'equals',
        value: 'Tamil Nadu',
        source_url: 'https://official.gov.in/scheme',
      }],
    });

    const result = evaluateSchemeMatch(scheme, { ...getProfile(), state: '' }, []);
    expect(result.eligibilityScore).toBe(0);
    expect(result.readinessScore).toBe(0);
    expect(result.unknownCriteria).toHaveLength(1);
    expect(result.status).toBe('more_information_required');
  });

  it('counts unknown criteria as pending in readiness while identifying them separately', () => {
    const scheme = createScheme({
      required_documents: [],
      eligibility_rules: [
        {
          field: 'age',
          operator: 'gte',
          value: '18',
          source_url: 'https://official.gov.in/scheme',
        },
        {
          field: 'district',
          operator: 'equals',
          value: 'Madurai',
          source_url: 'https://official.gov.in/scheme',
        },
      ],
    });

    const result = evaluateSchemeMatch(scheme, { ...profile, district: '' }, []);

    expect(result.eligibilityScore).toBe(50);
    expect(result.readinessScore).toBe(50);
    expect(result.unknownCriteria).toHaveLength(1);
    expect(result.status).toBe('more_information_required');
  });

  it('reduces readiness for each required document missing from the wallet', () => {
    const scheme = createScheme({
      required_documents: ['aadhaar_card', 'marksheet'],
      eligibility_rules: [{
        field: 'age',
        operator: 'gte',
        value: '18',
        source_url: 'https://official.gov.in/scheme',
      }],
    });

    const result = evaluateSchemeMatch(scheme, profile, ['aadhaar_card']);

    expect(result.eligibilityScore).toBe(100);
    expect(result.documentMatchScore).toBe(50);
    expect(result.documentEligibilityScore).toBe(40);
    expect(result.readinessScore).toBe(67);
    expect(result.missingDocuments).toEqual(['marksheet']);
  });

  it('reports mandatory rule failures separately', () => {
    const scheme = createScheme({
      required_documents: [],
      eligibility_rules: [{
        field: 'state',
        operator: 'equals',
        value: 'Kerala',
        source_url: 'https://official.gov.in/scheme',
      }],
    });

    const result = evaluateSchemeMatch(scheme, profile, []);
    expect(result.eligibilityScore).toBe(0);
    expect(result.failedCriteria).toHaveLength(1);
    expect(result.status).toBe('eligibility_criteria_not_met');
  });

  it('distinguishes a known false disability answer from an unknown answer', () => {
    const scheme = createScheme({
      required_documents: [],
      eligibility_rules: [{
        field: 'has_disability',
        operator: 'equals',
        value: 'false',
        source_url: 'https://official.gov.in/scheme',
      }],
    });

    const knownNo = evaluateSchemeMatch(scheme, { ...getProfile(), has_disability: false }, []);
    const unanswered = evaluateSchemeMatch(scheme, { ...getProfile(), has_disability: null }, []);

    expect(knownNo.eligibilityScore).toBe(100);
    expect(knownNo.status).toBe('ready_for_next_step');
    expect(unanswered.eligibilityScore).toBe(0);
    expect(unanswered.status).toBe('more_information_required');
  });

  it('marks present wallet documents as pending verification and returns all final metrics', () => {
    const scheme = createScheme({
      required_documents: ['aadhaar_card'],
      eligibility_rules: [{
        field: 'age',
        operator: 'gte',
        value: '18',
        source_url: 'https://official.gov.in/scheme',
      }],
    });

    const result = evaluateSchemeMatch(scheme, profile, ['aadhaar_card']);

    expect(result.eligibilityScore).toBe(100);
    expect(result.documentMatchScore).toBe(100);
    expect(result.documentEligibilityScore).toBe(80);
    expect(result.readinessScore).toBe(100);
    expect(result.requiredDocuments).toEqual([{
      id: 'aadhaar_card',
      status: 'uploaded_pending_verification',
    }]);
    expect(result.status).toBe('ready_for_next_step');
  });

  it('reports a strong potential match for a high eligibility score with optional mismatch', () => {
    const scheme = createScheme({
      required_documents: [],
      eligibility_rules: [
        {
          field: 'age',
          operator: 'gte',
          value: '18',
          source_url: 'https://official.gov.in/scheme',
        },
        {
          field: 'annual_income',
          operator: 'lte',
          value: '300000',
          source_url: 'https://official.gov.in/scheme',
        },
        {
          field: 'state',
          operator: 'equals',
          value: 'Tamil Nadu',
          source_url: 'https://official.gov.in/scheme',
        },
        {
          field: 'gender',
          operator: 'equals',
          value: 'other',
          source_url: 'https://official.gov.in/scheme',
        },
        {
          field: 'district',
          operator: 'equals',
          value: 'Madurai',
          source_url: 'https://official.gov.in/scheme',
          required: false,
        },
      ],
    });

    const result = evaluateSchemeMatch(scheme, profile, []);

    expect(result.eligibilityScore).toBe(80);
    expect(result.status).toBe('strong_potential_match');
  });

  it('calculates a different document-match percentage for each scheme requirement list', () => {
    const schemeWithOneOfTwo = createScheme({ required_documents: ['aadhaar_card', 'marksheet'] });
    const schemeWithOneOfFour = createScheme({
      id: 'another-scheme',
      required_documents: ['aadhaar_card', 'marksheet', 'income_certificate', 'caste_certificate'],
    });

    const first = evaluateSchemeMatch(schemeWithOneOfTwo, profile, ['aadhaar_card']);
    const second = evaluateSchemeMatch(schemeWithOneOfFour, profile, ['aadhaar_card']);

    expect(first.documentMatchScore).toBe(50);
    expect(first.documentEligibilityScore).toBe(40);
    expect(second.documentMatchScore).toBe(25);
    expect(second.documentEligibilityScore).toBe(20);
  });

  it('provides prototype document matching for every starter scheme without marking them verified', () => {
    for (const scheme of getSchemes()) {
      const result = evaluateSchemeMatch(scheme, profile, []);
      expect(scheme.is_published).toBe(false);
      expect(result.isPrototypeDocumentMatch).toBe(true);
      expect(result.documentEligibilityScore).toBe(0);
      expect(result.requiredDocuments.length).toBeGreaterThan(0);
      expect(result.eligibilityScore).toBeNull();
    }
  });

  it('awards 80 document-based application eligibility points only when every required document is in the wallet', () => {
    const scheme = createScheme({ required_documents: ['aadhaar_card', 'marksheet', 'income_certificate', 'caste_certificate'] });

    const complete = evaluateSchemeMatch(scheme, profile, scheme.required_documents);
    const threeOfFour = evaluateSchemeMatch(scheme, profile, scheme.required_documents.slice(0, 3));

    expect(complete.documentEligibilityScore).toBe(80);
    expect(threeOfFour.documentEligibilityScore).toBe(60);
  });
});

describe('getSchemes', () => {
  it('uses the starter catalogue when no catalogue has been saved', () => {
    localStorage.removeItem('serve_sahayak_schemes_v2');

    const schemes = getSchemes();

    expect(schemes.map((scheme) => scheme.id)).toEqual(expect.arrayContaining([
      'pudhumai-penn',
      'tamil-pudhalvan',
      'pm-kisan',
      'ayushman-bharat-pm-jay',
      'kalaignar-magalir-urimai-thogai',
      'nsp-pm-yasasvi',
      'nsp-csss',
      'nsp-jk-ladakh-special-scholarship',
      'pmay-u-2-0',
      'nsap',
    ]));
    expect(schemes).toHaveLength(10);
    expect(schemes.every((scheme) => (
      !scheme.is_published
      && scheme.verification_status === 'draft'
      && scheme.last_verified_at === null
      && scheme.source_urls.length > 0
    ))).toBe(true);
  });

  it('preserves an intentionally empty catalogue after deleting all schemes', () => {
    localStorage.setItem('serve_sahayak_schemes_v2', '[]');

    expect(getSchemes()).toEqual([]);
  });
});
