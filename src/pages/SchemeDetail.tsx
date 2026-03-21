import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Volume2, VolumeX, CheckCircle, XCircle, ArrowRight, AlertTriangle, Shield, Download } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';
import { documentTypes } from '@/lib/languages';

const SchemeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [scheme, setScheme] = useState<any>(null);
  const [walletDocs, setWalletDocs] = useState<string[]>([]);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const [sRes, dRes] = await Promise.all([
        supabase.from('schemes').select('*').eq('id', id).single(),
        supabase.from('wallet_documents').select('document_type').eq('user_id', user.id),
      ]);
      if (sRes.data) setScheme(sRes.data);
      if (dRes.data) setWalletDocs(dRes.data.map(d => d.document_type));
    };
    fetch();
  }, [id, navigate]);

  useEffect(() => {
    if (voiceEnabled && scheme) {
      speak();
    } else {
      speechSynthesis.cancel();
      setSpeaking(false);
    }
    return () => { speechSynthesis.cancel(); };
  }, [voiceEnabled]);

  const speak = () => {
    speechSynthesis.cancel();
    const required = scheme.required_documents as string[];
    const docNames = required.map((docId: string) => documentTypes.find(d => d.id === docId)?.label || docId.replace(/_/g, ' ')).join(', ');
    const text = `${scheme.name}. ${scheme.description}. Benefits: ${scheme.benefits}. Required documents: ${docNames}. Your eligibility is ${eligibility} percent.`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = language || 'en';
    u.onend = () => setSpeaking(false);
    u.onstart = () => setSpeaking(true);
    speechSynthesis.speak(u);
  };

  if (!scheme) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-16 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  );

  const required = scheme.required_documents as string[];
  const eligibility = required.length === 0 ? 100 : Math.round(required.filter((d: string) => walletDocs.includes(d)).length / required.length * 100);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-2xl space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold font-display">{scheme.name}</h1>
          <Badge variant="secondary" className="mt-2 rounded-lg">{scheme.category}</Badge>
        </div>

        {/* Voice Toggle */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {speaking ? (
                <Volume2 className="w-5 h-5 text-primary animate-pulse-soft" />
              ) : (
                <VolumeX className="w-5 h-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-semibold">Voice Assistant</p>
                <p className="text-xs text-muted-foreground">Read scheme details aloud</p>
              </div>
            </div>
            <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
          </CardContent>
        </Card>

        <p className="text-muted-foreground leading-relaxed">{scheme.description}</p>

        {/* Benefits */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 space-y-2">
            <h3 className="font-bold font-display text-lg">Benefits</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{scheme.benefits}</p>
          </CardContent>
        </Card>

        {/* Eligibility */}
        <Card className="border-0 shadow-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-display text-lg">AI Eligibility Score</h3>
              <span className={`text-2xl font-bold font-display ${
                eligibility >= 80 ? 'text-success' : eligibility >= 50 ? 'text-warning' : 'text-destructive'
              }`}>
                {eligibility}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  eligibility >= 80 ? 'bg-success' : eligibility >= 50 ? 'bg-warning' : 'bg-destructive'
                }`}
                style={{ width: `${eligibility}%` }}
              />
            </div>

            {eligibility < 100 && eligibility >= 50 && (
              <div className="p-3 bg-warning/10 rounded-xl text-xs text-warning font-medium">
                💡 Upload missing documents to reach 100% eligibility
              </div>
            )}

            <div className="space-y-2 pt-2">
              <p className="text-sm font-semibold text-foreground">Required Documents</p>
              {required.map((docId: string) => {
                const hasIt = walletDocs.includes(docId);
                const label = documentTypes.find(d => d.id === docId)?.label || docId.replace(/_/g, ' ');
                return (
                  <div key={docId} className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
                    hasIt ? 'bg-success/5' : 'bg-destructive/5'
                  }`}>
                    {hasIt ? (
                      <CheckCircle className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive shrink-0" />
                    )}
                    <span className={`font-medium flex-1 ${hasIt ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                    {hasIt ? (
                      <Badge className="bg-success/10 text-success border-0 text-[10px] px-2 h-5">
                        ✅ Available
                      </Badge>
                    ) : (
                      <div className="flex gap-1.5">
                        <Button variant="outline" size="sm" className="h-7 text-xs rounded-lg" onClick={() => navigate('/wallet')}>
                          Upload
                        </Button>
                        <Button size="sm" className="h-7 text-xs rounded-lg gap-1" onClick={() => navigate('/wallet')}>
                          <Download className="w-3 h-3" /> DigiLocker
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Security note */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3.5 h-3.5" />
          <span>Your data is सुरक्षित and encrypted</span>
        </div>

        <Button
          className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          size="lg"
          disabled={eligibility < 50}
          onClick={() => navigate(`/apply/${scheme.id}`)}
        >
          {eligibility >= 50 ? (
            <>Apply Now <ArrowRight className="w-4 h-4" /></>
          ) : (
            <><AlertTriangle className="w-4 h-4" /> Upload more documents to apply</>
          )}
        </Button>
      </main>
      <Chatbot />
    </div>
  );
};

export default SchemeDetail;
