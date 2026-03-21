import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, ArrowLeft, Loader2, ShieldCheck, Send, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { documentTypes } from '@/lib/languages';
import { toast } from 'sonner';

const ApplyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState<any>(null);
  const [walletDocs, setWalletDocs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('applications').insert({
        user_id: user.id,
        scheme_id: id,
        status: 'pending',
      });
      if (error) throw error;
      toast.success('Application submitted successfully!');
      navigate('/applications');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-lg space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold font-display">Apply: {scheme.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">Documents auto-fetched from your wallet</p>
        </div>

        <Card className="border-0 shadow-card animate-fade-in-scale">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <CardTitle className="text-base font-display">Required Documents</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {required.map((docId: string) => {
              const has = walletDocs.includes(docId);
              const label = documentTypes.find(d => d.id === docId)?.label || docId.replace(/_/g, ' ');
              return (
                <div key={docId} className={`flex items-center gap-3 p-3.5 rounded-xl ${
                  has ? 'bg-success/5' : 'bg-destructive/5'
                }`}>
                  {has ? (
                    <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                  <span className="text-sm font-medium flex-1">{label}</span>
                  {has ? (
                    <Badge className="bg-success/10 text-success border-0 text-[10px] px-2 h-5">Auto-attached</Badge>
                  ) : (
                    <div className="flex gap-1.5">
                      <Button variant="outline" size="sm" className="rounded-lg h-7 text-xs" onClick={() => navigate('/wallet')}>Upload</Button>
                      <Button size="sm" className="rounded-lg h-7 text-xs gap-1" onClick={() => navigate('/wallet')}>
                        <Download className="w-3 h-3" /> DigiLocker
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Button
          className="w-full h-12 rounded-xl font-semibold text-base gap-2"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Application</>
          )}
        </Button>
      </main>
      <Chatbot />
    </div>
  );
};

export default ApplyPage;
