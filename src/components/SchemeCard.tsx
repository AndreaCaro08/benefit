import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Wheat, Home, GraduationCap, Flame, Briefcase, TrendingUp, Award, FileText, Volume2, ExternalLink, Wallet, type LucideIcon } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { documentTypes } from '@/lib/languages';
import type { Scheme, SchemeMatch } from '@/lib/mockData';

const iconMap: Record<string, LucideIcon> = {
  Heart, Wheat, Home, GraduationCap, Flame, Briefcase, TrendingUp, Award, FileText,
};

interface SchemeCardProps {
  scheme: Scheme;
  match: SchemeMatch;
  onViewDetails: (id: string) => void;
  onAddDocuments: () => void;
}

const SchemeCard = ({ scheme, match, onViewDetails, onAddDocuments }: SchemeCardProps) => {
  const Icon = iconMap[scheme.icon] || FileText;
  const { language } = useLanguage();
  const sourceUrl = /^https?:\/\//i.test(scheme.source_url) ? scheme.source_url : '';
  const isVerified = scheme.is_published && scheme.verification_status === 'published' && Boolean(scheme.last_verified_at);
  const applicationUrl = isVerified && /^https?:\/\//i.test(scheme.application_url || '') ? scheme.application_url : '';
  const copy = language === 'ta'
    ? {
      readiness: 'ஆவணப் பொருத்த மதிப்பீடு (அதிகபட்சம் 80%)',
      documentMatch: 'திட்ட ஆவணப் பொருத்தம்',
      unavailable: 'தெரியவில்லை',
      draft: 'தகுதி விதிகள் சரிபார்க்கப்படவில்லை.',
      profile: 'சுயவிவரத் தகவல் தேவை.',
      check: 'தகுதியைச் சரிபார்',
      documents: 'ஆவணங்கள்',
      required: 'தேவையான ஆவணங்கள்',
      apply: 'அதிகாரப்பூர்வ தளத்தில் விண்ணப்பிக்கவும்',
      status: {
        strong_potential_match: 'அதிக வாய்ப்புள்ள பொருத்தம்',
        more_information_required: 'கூடுதல் தகவல் தேவை',
        documents_pending: 'ஆவணங்கள் நிலுவையில்',
        eligibility_criteria_not_met: 'தகுதி நிபந்தனைகள் பொருந்தவில்லை',
        ready_for_next_step: 'அடுத்த படிக்கு தயார்',
      },
    }
    : {
      readiness: 'Document-based eligibility estimate (max 80%)',
      documentMatch: 'Scheme document match',
      unavailable: 'Unavailable',
      draft: 'Eligibility rules are not verified.',
      profile: 'Profile information is needed.',
      check: 'Check eligibility',
      documents: 'Documents',
      required: 'Required documents',
      apply: 'Apply on official site',
      status: {
        strong_potential_match: 'Strong potential match',
        more_information_required: 'More information required',
        documents_pending: 'Documents pending',
        eligibility_criteria_not_met: 'Eligibility criteria not met',
        ready_for_next_step: 'Ready for next step',
      },
    };

  const getReadinessColor = (pct: number) => {
    if (pct >= 80) return 'text-success';
    if (pct >= 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  const speakScheme = () => {
    const utterance = new SpeechSynthesisUtterance(
      `${scheme.name}. ${scheme.description}. Benefits: ${scheme.benefits}`
    );
    utterance.lang = language || 'en';
    speechSynthesis.speak(utterance);
  };

  return (
    <Card className="group shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-0 bg-card overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${match.documentEligibilityScore !== null && match.documentEligibilityScore >= 64 ? 'bg-success' : match.documentEligibilityScore !== null && match.documentEligibilityScore >= 40 ? 'bg-warning' : 'bg-muted'}`} />
      
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm leading-tight font-display line-clamp-2">{scheme.name}</h3>
              <Badge variant="secondary" className="mt-1.5 text-[10px] font-semibold rounded-md px-2 py-0.5">{scheme.category}</Badge>
              <Badge variant="outline" className="mt-1 ml-1 text-[10px]">
                {isVerified ? 'Verified' : match.isPrototypeDocumentMatch ? 'Eligibility estimate · unverified' : 'Draft · unverified'}
              </Badge>
            </div>
          </div>
          <button
            onClick={speakScheme}
            className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-all shrink-0"
            title="Read aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{scheme.description}</p>

        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            View listed government source <ExternalLink className="h-3 w-3" />
          </a>
        )}

        {/* Eligibility meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">{copy.readiness}</span>
            <span className={`font-bold ${match.documentEligibilityScore === null ? 'text-muted-foreground' : getReadinessColor(match.documentEligibilityScore)}`}>
            {match.documentEligibilityScore === null ? copy.unavailable : `${match.documentEligibilityScore}%`}
            </span>
          </div>
          <div className="h-2 bg-foreground/25 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${match.documentEligibilityScore === null ? 'bg-muted-foreground/30' : 'bg-warning'}`}
              style={{ width: `${match.documentEligibilityScore ?? 0}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {match.documentEligibilityScore === null
              ? copy.draft
              : `${language === 'ta' ? 'தேவையான ஆவணங்களின் பொருத்த மதிப்பீடு; அரசு ஒப்புதல் உறுதி அல்ல' : 'Document-match estimate only; not a government approval or full eligibility decision'}`}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          {copy.documentMatch}: {match.documentMatchScore === null
            ? copy.unavailable
            : `${match.documentMatchScore}% (${match.requiredDocuments.filter((document) => document.status === 'uploaded_pending_verification').length}/${match.requiredDocuments.length})`}
        </p>
        {match.missingDocuments.length > 0 && (
          <p className="text-xs text-warning bg-warning/10 rounded-lg px-3 py-2">
            {copy.required}: {match.missingDocuments.map((documentId) => (
              documentTypes.find((document) => document.id === documentId)?.label || documentId.replace(/_/g, ' ')
            )).join(', ')}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            className="flex-1 rounded-xl h-9"
            onClick={() => onViewDetails(scheme.id)}
          >
            {copy.check}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl h-9 gap-1.5"
            onClick={onAddDocuments}
          >
            <Wallet className="w-3.5 h-3.5" /> {copy.documents}
          </Button>
        </div>
        {applicationUrl && (
          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            {copy.apply} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default SchemeCard;
