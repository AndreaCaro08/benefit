
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Volume2, VolumeX, ExternalLink, Shield, Wallet } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { documentTypes } from '@/lib/languages';
import { evaluateSchemeMatch, getProfile, type Scheme, type UserProfile, type WalletDoc } from '@/lib/mockData';
import EligibilityMatchPanel from '@/components/EligibilityMatchPanel';
import { loadProfile, loadSchemes, loadWallet, uploadWalletFile } from '@/lib/dataService';
import { toast } from 'sonner';

const SchemeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [walletDocs, setWalletDocs] = useState<WalletDoc[]>([]);
  const [uploadingDocumentId, setUploadingDocumentId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const [loading, setLoading] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([loadSchemes(), loadWallet(), loadProfile()])
      .then(([catalog, documents, nextProfile]) => {
        if (!active) return;
        setScheme(catalog.schemes.find((item) => item.id === id) || null);
        if (catalog.notice) toast.warning(catalog.notice);
        setWalletDocs(documents);
        setProfile(nextProfile);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Unable to load scheme details.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const match = useMemo(() => {
    if (!scheme) return null;
    return evaluateSchemeMatch(scheme, profile, walletDocs.map((document) => document.document_type));
  }, [scheme, profile, walletDocs]);
  const schemeVerified = Boolean(scheme
    && scheme.is_published
    && scheme.verification_status === 'published'
    && scheme.last_verified_at);

  const handleUploadRequiredDocument = (documentId: string) => {
    const documentType = documentTypes.find((document) => document.id === documentId);
    const label = language === 'ta'
      ? documentType?.labelTa || documentType?.label || documentId.replace(/_/g, ' ')
      : documentType?.label || documentId.replace(/_/g, ' ');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setUploadingDocumentId(documentId);
      try {
        const uploaded = await uploadWalletFile(documentId, file);
        setWalletDocs((current) => [
          uploaded,
          ...current.filter((item) => item.document_type !== documentId),
        ]);
        toast.success(language === 'ta' ? `${label} Wallet-இல் சேமிக்கப்பட்டது.` : `${label} uploaded to your wallet.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to upload this document.');
      } finally {
        setUploadingDocumentId(null);
      }
    };
    input.click();
  };

  const speak = useCallback(() => {
    if (!scheme) return;

    const docNames = scheme.required_documents
      .map((docId) => documentTypes.find((doc) => doc.id === docId)?.label || docId.replace(/_/g, ' '))
      .join(', ');
    const uploadedRequiredCount = scheme.required_documents.filter((documentId) =>
      walletDocs.some((document) => document.document_type === documentId),
    ).length;
    const documentCompletion = schemeVerified && scheme.required_documents.length > 0
      ? Math.round((uploadedRequiredCount / scheme.required_documents.length) * 100)
      : null;

    const utterance = new SpeechSynthesisUtterance(
      `${scheme.name}. ${scheme.description}. Benefits: ${scheme.benefits}. Required documents: ${docNames || 'unknown'}. The verified profile eligibility match is ${match?.eligibilityScore == null ? 'unavailable' : `${match.eligibilityScore} percent`}. Document-based eligibility to apply is ${match?.documentEligibilityScore == null ? 'unavailable' : `${match.documentEligibilityScore} out of 80 points`}. Document completion is ${documentCompletion == null ? 'unavailable' : `${documentCompletion} percent`}. These are informational checks, not a guarantee of approval.`
    );
    utterance.lang = language || 'en';
    speechSynthesis.cancel();
    speechRef.current = utterance;
    utterance.onstart = () => {
      if (speechRef.current === utterance) setSpeaking(true);
    };
    utterance.onend = () => {
      if (speechRef.current === utterance) {
        speechRef.current = null;
        setSpeaking(false);
      }
    };
    utterance.onerror = () => {
      if (speechRef.current === utterance) {
        speechRef.current = null;
        setSpeaking(false);
      }
    };
    setSpeaking(false);
    speechSynthesis.speak(utterance);
  }, [language, match, scheme, schemeVerified, walletDocs]);

  useEffect(() => {
    if (!voiceEnabled || !scheme) {
      speechRef.current = null;
      speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    speak();

    return () => {
      speechRef.current = null;
      speechSynthesis.cancel();
      setSpeaking(false);
    };
  }, [voiceEnabled, scheme, speak]);

  const handleVoiceToggle = (enabled: boolean) => {
    if (!enabled) {
      speechRef.current = null;
      speechSynthesis.cancel();
      setSpeaking(false);
    }
    setVoiceEnabled(enabled);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-16 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container py-16 text-center">
          <h1 className="text-xl font-semibold">Scheme record unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">This record may have been removed from the catalogue.</p>
          <Button className="mt-5" onClick={() => navigate('/explore')}>Back to schemes</Button>
        </main>
      </div>
    );
  }

  const verifiedApplicationUrl = schemeVerified && /^https?:\/\//i.test(scheme.application_url || '')
    ? scheme.application_url
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-2xl space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display">{scheme.name}</h1>
          <Badge variant="secondary" className="mt-2 rounded-lg">{scheme.category}</Badge>
          <Badge variant="outline" className="ml-2 mt-2 rounded-lg">
            {schemeVerified ? 'Verified and published' : match?.isPrototypeDocumentMatch ? 'Eligibility estimate · unverified' : 'Draft · unverified'}
          </Badge>
          {scheme.translation_status !== 'verified' && (
            <Badge variant="outline" className="ml-2 mt-2 rounded-lg">Tamil translation unverified</Badge>
          )}
        </div>

        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {speaking ? <Volume2 className="w-5 h-5 text-primary animate-pulse-soft" /> : <VolumeX className="w-5 h-5 text-muted-foreground" />}
              <div>
                <p className="text-sm font-semibold">Voice Assistant</p>
                <p className="text-xs text-muted-foreground">Read scheme details aloud</p>
              </div>
            </div>
            <Switch checked={voiceEnabled} onCheckedChange={handleVoiceToggle} />
          </CardContent>
        </Card>

        <p className="text-muted-foreground leading-relaxed">{scheme.description}</p>

        <Card className="border-0 shadow-card">
          <CardContent className="p-6 space-y-2">
            <h3 className="font-bold font-display text-lg">Benefits</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{scheme.benefits}</p>
          </CardContent>
        </Card>

        {match && (
          <EligibilityMatchPanel
            scheme={scheme}
            match={match}
            walletDocs={walletDocs}
            language={language}
            uploadingDocumentId={uploadingDocumentId}
            onUpload={handleUploadRequiredDocument}
            onUpdateProfile={() => navigate('/profile')}
          />
        )}

        <Card className="border-0 shadow-card">
          <CardContent className="space-y-3 p-5">
            <h3 className="font-bold font-display text-lg">Where to apply</h3>
            {verifiedApplicationUrl ? (
              <Button asChild className="w-full">
                <a href={verifiedApplicationUrl} target="_blank" rel="noopener noreferrer">
                  Open official application portal <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            ) : (
              <p className="rounded-xl bg-muted/50 p-3 text-sm text-muted-foreground">A direct application link has not been verified. Use the official source links below to confirm current instructions.</p>
            )}
            {scheme.source_urls.length > 0 && (
              <ul className="space-y-2">
                {scheme.source_urls.map((sourceUrl) => (
                  <li key={sourceUrl}>
                    <a className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline" href={sourceUrl} target="_blank" rel="noopener noreferrer">
                      Official scheme source <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-muted-foreground">Last verified: {scheme.last_verified_at || 'Unknown'}</p>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>Match score is guidance only, not approval probability. Final decisions belong to the responsible government authority.</span>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link to="/wallet"><Wallet className="h-4 w-4" /> Add or review wallet documents</Link>
        </Button>
      </main>
      <Chatbot />
    </div>
  );
};

export default SchemeDetail;
