import { AlertCircle, CheckCircle2, Clock3, FileText, HelpCircle, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { documentTypes } from '@/lib/languages';
import { MAX_WALLET_DOCUMENTS, type EligibilityCheck, type Scheme, type SchemeMatch, type WalletDoc } from '@/lib/mockData';
import { Link } from 'react-router-dom';

const tamil = {
  title: 'உங்கள் தகுதி சரிபார்ப்பு',
  status: {
    strong_potential_match: 'அதிக வாய்ப்புள்ள பொருத்தம்',
    more_information_required: 'கூடுதல் தகவல் தேவை',
    documents_pending: 'ஆவணங்கள் நிலுவையில்',
    eligibility_criteria_not_met: 'தகுதி நிபந்தனைகள் பொருந்தவில்லை',
    ready_for_next_step: 'அடுத்த விண்ணப்ப படிக்கு தயார்',
  },
  eligibility: 'தகுதி பொருத்தம்',
  documentEligibility: 'ஆவணப் பொருத்த மதிப்பீடு (அதிகபட்சம் 80%)',
  documentCompletion: 'ஆவண நிறைவு',
  documentMatch: 'திட்ட ஆவணப் பொருத்தம்',
  documentCount: 'தேவையான ஆவணங்கள்',
  noScore: 'தகுதி விவரங்கள் சரிபார்க்கப்படாததால் மதிப்பெண் கிடைக்கவில்லை.',
  explanation: 'தகுதி சதவீதம் சரிபார்க்கப்பட்ட நிபந்தனைகளின் ஒப்பீடு மட்டுமே; இது அரசின் ஒப்புதல் உறுதி அல்ல.',
  noDocumentsYet: 'தேவையான ஆவணங்கள் எதுவும் Wallet-இல் இல்லை; இந்த ஆவண மதிப்பீடு 0%.',
  matched: 'பொருந்திய நிபந்தனைகள்',
  unmatched: 'பொருந்தாத நிபந்தனைகள்',
  unknown: 'தெரியாத / சரிபார்க்கப்படாதவை',
  docs: 'முழுமையான ஆவண சரிபார்ப்புப் பட்டியல்',
  uploadedDocs: 'பதிவேற்றிய ஆவணங்கள்',
  missingDocs: 'காணாமல் உள்ள ஆவணங்கள்',
  pendingDocs: 'சரிபார்ப்பு நிலுவையில் உள்ளவை',
  docsUnknown: 'தேவையான ஆவணங்கள் இன்னும் சரிபார்க்கப்படவில்லை.',
  upload: 'ஆவணத்தைப் பதிவேற்று',
  uploading: 'பதிவேற்றப்படுகிறது…',
  missing: 'காணவில்லை',
  uploaded: 'பதிவேற்றப்பட்டது',
  pending: 'சரிபார்ப்பு நிலுவையில்',
  none: 'எதுவும் இல்லை',
  walletLimit: 'Wallet-இல் அதிகபட்சம் 6 ஆவணங்கள் மட்டுமே வைக்கலாம். புதிய ஆவணத்தைப் பதிவேற்ற, Wallet-இல் உள்ள ஒன்றை நீக்கவும் அல்லது மாற்றவும்.',
  openWallet: 'Wallet-ஐத் திற',
  unknownRequirements: 'இந்தத் திட்டத்தின் தகுதி நிபந்தனைகள் இன்னும் சரிபார்க்கப்படவில்லை.',
  ready: 'பதிவுசெய்யப்பட்ட சரிபார்ப்புகள் முடிந்துள்ளன. அதிகாரப்பூர்வ விண்ணப்பத்தில் விவரங்களை உறுதிப்படுத்தவும்.',
  nextSteps: 'விண்ணப்பத்திற்கு முன் செய்ய வேண்டியது',
  addProfile: 'தெரியாத நிபந்தனைகளை மதிப்பிட சுயவிவர விவரங்களை நிரப்பவும்.',
  uploadMissing: 'காணாமல் உள்ள தேவையான ஆவணங்களை Wallet-இல் பதிவேற்றவும்.',
  officialReview: 'பதிவேற்றிய ஆவணங்களின் உண்மைத்தன்மையை இந்த செயலி சரிபார்க்காது; அதிகாரப்பூர்வ அமைப்பில் சரிபார்க்கப்படும்.',
  profileButton: 'சுயவிவரத்தைப் புதுப்பி',
};

const english = {
  title: 'Your eligibility check',
  status: {
    strong_potential_match: 'Strong Potential Match',
    more_information_required: 'More Information Required',
    documents_pending: 'Documents Pending',
    eligibility_criteria_not_met: 'Eligibility Criteria Not Met',
    ready_for_next_step: 'Ready for Next Application Step',
  },
  eligibility: 'Eligibility match',
  documentEligibility: 'Document-based eligibility estimate (max 80%)',
  documentCompletion: 'Document completion',
  documentMatch: 'Scheme document match',
  documentCount: 'Required documents',
  noScore: 'No score: scheme eligibility requirements are not verified.',
  explanation: 'Eligibility percentage compares your profile with verified conditions. It is guidance—not approval probability or a government decision.',
  noDocumentsYet: 'None of the required documents are in your wallet yet; the document estimate is 0%.',
  matched: 'Matched conditions',
  unmatched: 'Unmatched conditions',
  unknown: 'Unknown / unanswered conditions',
  docs: 'Required documents',
  uploadedDocs: 'Uploaded documents',
  missingDocs: 'Missing documents',
  pendingDocs: 'Pending verification',
  docsUnknown: 'Required documents are unknown until verified for this scheme.',
  upload: 'Upload document',
  uploading: 'Uploading…',
  missing: 'Missing',
  uploaded: 'Uploaded',
  pending: 'Pending verification',
  none: 'None',
  walletLimit: 'Your wallet holds up to 6 documents. Remove a document or replace one in your wallet before uploading another.',
  openWallet: 'Open wallet',
  unknownRequirements: 'This scheme’s eligibility requirements have not been verified.',
  ready: 'All recorded checks are complete. Confirm details in the official application process.',
  nextSteps: 'What to complete before applying',
  addProfile: 'Complete your profile to check the unanswered eligibility conditions.',
  uploadMissing: 'Upload the missing required documents to your wallet.',
  officialReview: 'This app cannot verify document authenticity. The responsible authority will review documents during the official process.',
  profileButton: 'Update profile',
};

const fieldLabels: Record<string, { en: string; ta: string }> = {
  age: { en: 'Age', ta: 'வயது' },
  annual_income: { en: 'Annual income', ta: 'ஆண்டு வருமானம்' },
  district: { en: 'District', ta: 'மாவட்டம்' },
  gender: { en: 'Gender', ta: 'பாலினம்' },
  has_disability: { en: 'Disability status', ta: 'மாற்றுத்திறன் நிலை' },
  household_type: { en: 'Household group', ta: 'குடும்ப வகை' },
  state: { en: 'State', ta: 'மாநிலம்' },
};

const conditionText = (check: EligibilityCheck, isTamil: boolean): string => {
  const field = fieldLabels[check.field]?.[isTamil ? 'ta' : 'en'] || check.field.replace(/_/g, ' ');
  const operator = {
    equals: isTamil ? 'இருக்க வேண்டும்' : 'must be',
    in: isTamil ? 'இவற்றில் ஒன்று இருக்க வேண்டும்' : 'must be one of',
    exists: isTamil ? 'பதிவிட வேண்டும்' : 'must be provided',
    unknown: isTamil ? 'தெரியவில்லை' : 'is unknown',
    gte: isTamil ? 'குறைந்தது' : 'at least',
    lte: isTamil ? 'அதிகபட்சம்' : 'at most',
  }[check.operator];
  return `${field} ${operator}${check.operator === 'exists' || check.operator === 'unknown' ? '' : ` ${check.value}`}`;
};

const EligibilityMatchPanel = ({
  scheme,
  match,
  walletDocs,
  language,
  uploadingDocumentId,
  onUpload,
  onUpdateProfile,
}: {
  scheme: Scheme;
  match: SchemeMatch;
  walletDocs: WalletDoc[];
  language: string | null;
  uploadingDocumentId: string | null;
  onUpload: (documentId: string) => void;
  onUpdateProfile: () => void;
}) => {
  const isTamil = language === 'ta';
  const copy = isTamil ? tamil : english;
  const isVerified = scheme.is_published
    && scheme.verification_status === 'published'
    && Boolean(scheme.last_verified_at);
  const walletByType = new Map(walletDocs.map((document) => [document.document_type, document]));
  const walletLimitReached = walletDocs.length >= MAX_WALLET_DOCUMENTS;
  const requiredDocuments = match.requiredDocuments;
  const uploadedRequiredDocuments = requiredDocuments.filter((document) => walletByType.has(document.id));
  const missingRequiredDocuments = requiredDocuments.filter((document) => !walletByType.has(document.id));
  const missingCount = missingRequiredDocuments.length;
  const documentCompletion = match.documentMatchScore;
  const canShowDocumentMatch = isVerified || match.isPrototypeDocumentMatch;
  const hasUnknown = !isVerified || match.unknownCriteria.length > 0 || scheme.eligibility_rules.length === 0;
  const hasFailed = match.failedCriteria.length > 0;

  const renderProgress = (label: string, value: number | null, fillColor = 'bg-primary') => (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-lg font-bold">{value === null ? '—' : `${value}%`}</span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-foreground/25"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value ?? undefined}
      >
        <div className={`h-full rounded-full transition-all ${fillColor}`} style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );

  const renderCriteria = (title: string, checks: EligibilityCheck[], kind: 'matched' | 'unmatched' | 'unknown') => {
    if (checks.length === 0) return null;
    const Icon = kind === 'matched' ? CheckCircle2 : kind === 'unmatched' ? AlertCircle : HelpCircle;
    const color = kind === 'matched' ? 'text-success' : kind === 'unmatched' ? 'text-destructive' : 'text-warning';
    const background = kind === 'matched' ? 'bg-success/5' : kind === 'unmatched' ? 'bg-destructive/5' : 'bg-warning/10';
    return (
      <section className="space-y-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <Icon className={`h-4 w-4 ${color}`} />{title}
        </h4>
        {checks.map((check, index) => (
          <div key={`${check.field}-${check.operator}-${index}`} className={`rounded-lg p-3 text-sm ${background}`}>
            <div className="flex items-start justify-between gap-3">
              <span>{conditionText(check, isTamil)}</span>
              {!check.required && (
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {isTamil ? 'கூடுதல்' : 'Additional'}
                </Badge>
              )}
            </div>
            {check.source_url && /^https?:\/\//i.test(check.source_url) && (
              <a href={check.source_url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-primary underline">
                {isTamil ? 'அதிகாரப்பூர்வ ஆதாரம்' : 'Official source'}
              </a>
            )}
          </div>
        ))}
      </section>
    );
  };

  return (
    <Card id="match" className="border-0 shadow-card">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg font-display">{copy.title}</CardTitle>
          <Badge variant={match.status === 'ready_for_next_step' ? 'secondary' : 'outline'}>
            {copy.status[match.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {renderProgress(copy.eligibility, match.eligibilityScore, 'bg-warning')}
          {renderProgress(copy.documentEligibility, match.documentEligibilityScore, 'bg-warning')}
          {renderProgress(copy.documentCompletion, documentCompletion)}
        </div>
        <p className="text-xs text-muted-foreground">{copy.explanation}</p>
        {requiredDocuments.length > 0 && uploadedRequiredDocuments.length === 0 && (
          <p role="status" className="rounded-lg bg-warning/10 p-3 text-sm text-warning">{copy.noDocumentsYet}</p>
        )}

        {!isVerified && !match.isPrototypeDocumentMatch && (
          <p className="rounded-xl bg-warning/10 p-3 text-sm text-warning">{copy.unknownRequirements}</p>
        )}
        {isVerified && (
          <>
            {renderCriteria(copy.matched, match.matchedCriteria, 'matched')}
            {renderCriteria(copy.unmatched, match.failedCriteria, 'unmatched')}
            {renderCriteria(copy.unknown, match.unknownCriteria, 'unknown')}
            {scheme.eligibility_rules.length === 0 && (
              <p className="rounded-lg bg-warning/10 p-3 text-sm text-warning">{copy.unknownRequirements}</p>
            )}
          </>
        )}

        <section className="space-y-2">
          <h4 className="flex items-center gap-2 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />{copy.docs}
          </h4>
          {!canShowDocumentMatch || requiredDocuments.length === 0 ? (
            <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">{copy.docsUnknown}</p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                {copy.documentCount}: {uploadedRequiredDocuments.length}/{requiredDocuments.length} · {copy.documentCompletion}: {documentCompletion}%
              </p>
              {requiredDocuments.map((document) => {
                const walletDocument = walletByType.get(document.id);
                const documentType = documentTypes.find((item) => item.id === document.id);
                const label = isTamil
                  ? documentType?.labelTa || documentType?.label || document.id.replace(/_/g, ' ')
                  : documentType?.label || document.id.replace(/_/g, ' ');
                const isUploaded = Boolean(walletDocument);
                return (
                  <div
                    key={document.id}
                    className={`flex flex-wrap items-center gap-3 rounded-lg p-3 text-sm ${isUploaded ? 'bg-success/5' : 'bg-destructive/5'}`}
                  >
                    {isUploaded
                      ? <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                      : <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />}
                    <span className="min-w-0 flex-1 font-medium">{label}</span>
                    <span className={`text-xs ${isUploaded ? 'text-success' : 'text-destructive'}`}>
                      {isUploaded ? copy.uploaded : copy.missing}
                    </span>
                    {walletDocument && (
                      <span className="w-full truncate text-xs text-muted-foreground">{walletDocument.document_name} · {copy.pending}</span>
                    )}
                  </div>
                );
              })}
              <div className="grid gap-4 pt-3 sm:grid-cols-3">
                <DocumentGroup
                  title={copy.uploadedDocs}
                  ids={uploadedRequiredDocuments.map((document) => document.id)}
                  isTamil={isTamil}
                  emptyLabel={copy.none}
                />
                <DocumentGroup
                  title={copy.missingDocs}
                  ids={missingRequiredDocuments.map((document) => document.id)}
                  isTamil={isTamil}
                  emptyLabel={copy.none}
                  uploadLabel={copy.upload}
                  uploadingLabel={copy.uploading}
                  uploadingDocumentId={uploadingDocumentId}
                  uploadDisabled={walletLimitReached}
                  onUpload={onUpload}
                />
                <DocumentGroup
                  title={copy.pendingDocs}
                  ids={uploadedRequiredDocuments.map((document) => document.id)}
                  isTamil={isTamil}
                  emptyLabel={copy.none}
                  pending
                />
              </div>
              {walletLimitReached && missingRequiredDocuments.length > 0 && (
                <div role="note" className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-warning/10 p-3 text-sm">
                  <p className="text-warning">{copy.walletLimit}</p>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/wallet">{copy.openWallet}</Link>
                  </Button>
                </div>
              )}
              {uploadedRequiredDocuments.length > 0 && (
                <p className="text-xs text-muted-foreground">{copy.officialReview}</p>
              )}
            </>
          )}
        </section>

        {(hasFailed || hasUnknown || missingCount > 0) && (
          <section className="space-y-2 rounded-xl border p-4">
            <h4 className="text-sm font-semibold">{copy.nextSteps}</h4>
            {hasUnknown && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">{copy.addProfile}</p>
                {isVerified && scheme.eligibility_rules.length > 0 && (
                  <Button variant="outline" size="sm" onClick={onUpdateProfile}>{copy.profileButton}</Button>
                )}
              </div>
            )}
            {missingCount > 0 && <p className="text-sm text-muted-foreground">{copy.uploadMissing}</p>}
            {hasFailed && <p className="text-sm text-muted-foreground">{isTamil ? 'பொருந்தாத நிபந்தனைகளை அதிகாரப்பூர்வ ஆதாரத்தில் சரிபார்க்கவும்.' : 'Review unmatched conditions with the official scheme source.'}</p>}
          </section>
        )}
        {!hasFailed && !hasUnknown && missingCount === 0 && match.status === 'ready_for_next_step' && (
          <p className="rounded-xl bg-success/5 p-3 text-sm text-success">{copy.ready}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EligibilityMatchPanel;

const DocumentGroup = ({
  title,
  ids,
  isTamil,
  emptyLabel,
  pending = false,
  uploadLabel,
  uploadingLabel,
  uploadingDocumentId,
  uploadDisabled = false,
  onUpload,
}: {
  title: string;
  ids: string[];
  isTamil: boolean;
  emptyLabel: string;
  pending?: boolean;
  uploadLabel?: string;
  uploadingLabel?: string;
  uploadingDocumentId?: string | null;
  uploadDisabled?: boolean;
  onUpload?: (documentId: string) => void;
}) => (
  <section className="space-y-1.5 rounded-lg border p-3">
    <h5 className="flex items-center gap-1.5 text-xs font-semibold">
      {pending ? <Clock3 className="h-3.5 w-3.5 text-warning" /> : <FileText className="h-3.5 w-3.5 text-primary" />}
      {title} ({ids.length})
    </h5>
    {ids.length === 0 ? (
      <p className="text-xs text-muted-foreground">{emptyLabel}</p>
    ) : ids.map((id) => {
      const documentType = documentTypes.find((document) => document.id === id);
      const label = isTamil
        ? documentType?.labelTa || documentType?.label || id.replace(/_/g, ' ')
        : documentType?.label || id.replace(/_/g, ' ');
      return (
        <div key={id} className="flex items-center justify-between gap-2">
          <p className="min-w-0 text-xs text-muted-foreground">
            {pending ? `${label} · ${isTamil ? 'சரிபார்ப்பு நிலுவையில்' : 'Pending verification'}` : label}
          </p>
          {onUpload && (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              disabled={uploadDisabled || uploadingDocumentId === id}
              onClick={() => onUpload(id)}
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadingDocumentId === id ? uploadingLabel : uploadLabel}
            </Button>
          )}
        </div>
      );
    })}
  </section>
);
