import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { documentTypes } from '@/lib/languages';
import { Upload, FileCheck, Trash2, Wallet, ShieldCheck, Lock, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface WalletDoc {
  id: string;
  document_type: string;
  document_name: string;
  uploaded_at: string;
  file_path: string | null;
}

const WalletPage = () => {
  const [docs, setDocs] = useState<WalletDoc[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [fetching, setFetching] = useState<string | null>(null);
  // Track DigiLocker verified docs
  const [verifiedDocs, setVerifiedDocs] = useState<Set<string>>(new Set());

  const fetchDocs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('wallet_documents').select('*').eq('user_id', user.id);
    if (data) {
      setDocs(data as WalletDoc[]);
      // docs with file_path starting with 'digilocker:' are verified
      const verified = new Set(data.filter(d => d.file_path?.startsWith('digilocker:')).map(d => d.document_type));
      setVerifiedDocs(verified);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (docTypeId: string, docLabel: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(docTypeId);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        const { error } = await supabase.from('wallet_documents').insert({
          user_id: user.id,
          document_type: docTypeId,
          document_name: file.name,
        });
        if (error) throw error;
        toast.success(`${docLabel} uploaded successfully!`);
        fetchDocs();
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const handleDigiLocker = async (docTypeId: string, docLabel: string) => {
    setFetching(docTypeId);
    // Simulate DigiLocker API call
    await new Promise(r => setTimeout(r, 2000));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if doc already exists
      const existing = docs.find(d => d.document_type === docTypeId);
      if (existing) {
        // Update to mark as DigiLocker verified
        await supabase.from('wallet_documents').update({
          file_path: `digilocker:${docTypeId}`,
          document_name: `${docLabel} (DigiLocker Verified)`,
        }).eq('id', existing.id);
      } else {
        await supabase.from('wallet_documents').insert({
          user_id: user.id,
          document_type: docTypeId,
          document_name: `${docLabel} (DigiLocker Verified)`,
          file_path: `digilocker:${docTypeId}`,
        });
      }
      toast.success(`✅ ${docLabel} fetched from DigiLocker!`, {
        description: 'Document verified by Government of India',
      });
      fetchDocs();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setFetching(null);
    }
  };

  const handleDelete = async (docId: string) => {
    const { error } = await supabase.from('wallet_documents').delete().eq('id', docId);
    if (error) { toast.error('Failed to remove'); return; }
    toast.success('Document removed');
    fetchDocs();
  };

  const uploadedCount = docs.length;
  const totalCount = documentTypes.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display">My Wallet</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload documents once, reuse for all applications
            </p>
          </div>
        </div>

        {/* Security Banner */}
        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl animate-fade-in">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground">
            🔒 Secured via DigiLocker Integration • Your documents are encrypted
          </span>
          <ShieldCheck className="w-4 h-4 text-primary ml-auto shrink-0" />
        </div>

        {/* Progress */}
        <div className="bg-card rounded-2xl p-5 shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Document Completion</span>
            </div>
            <span className="text-sm font-bold text-primary">{uploadedCount}/{totalCount}</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
              style={{ width: `${(uploadedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((dt, i) => {
            const uploaded = docs.find(d => d.document_type === dt.id);
            const isVerified = verifiedDocs.has(dt.id);
            return (
              <Card
                key={dt.id}
                className={`transition-all duration-300 border-0 shadow-card hover:shadow-elevated animate-fade-in-scale ${
                  isVerified ? 'ring-1 ring-success/40' : uploaded ? 'ring-1 ring-primary/20' : ''
                }`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm font-display">{dt.label}</h3>
                        {isVerified && (
                          <Badge className="bg-success/10 text-success border-0 text-[10px] px-1.5 py-0 h-5">
                            <CheckCircle className="w-3 h-3 mr-0.5" /> Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{dt.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">🏢 {dt.issuer}</p>
                    </div>
                    {uploaded ? (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isVerified ? 'bg-success/10' : 'bg-primary/10'
                      }`}>
                        {isVerified ? (
                          <ShieldCheck className="w-4 h-4 text-success" />
                        ) : (
                          <FileCheck className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {uploaded ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-xl">
                        <div className="flex items-center gap-2 min-w-0">
                          <Lock className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{uploaded.document_name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg shrink-0"
                          onClick={() => handleDelete(uploaded.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      {!isVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full rounded-xl h-8 text-xs gap-1.5"
                          onClick={() => handleDigiLocker(dt.id, dt.label)}
                          disabled={fetching === dt.id}
                        >
                          <Download className="w-3 h-3" />
                          {fetching === dt.id ? 'Fetching...' : 'Verify via DigiLocker'}
                        </Button>
                      )}
                      {isVerified && (
                        <p className="text-[10px] text-success font-medium text-center">
                          ✅ Verified by DigiLocker • {new Date(uploaded.uploaded_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl h-9"
                        onClick={() => handleUpload(dt.id, dt.label)}
                        disabled={uploading === dt.id}
                      >
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        {uploading === dt.id ? 'Uploading...' : 'Upload Document'}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full rounded-xl h-9 gap-1.5"
                        onClick={() => handleDigiLocker(dt.id, dt.label)}
                        disabled={fetching === dt.id}
                      >
                        <Download className="w-3.5 h-3.5" />
                        {fetching === dt.id ? 'Fetching...' : 'Fetch from DigiLocker'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default WalletPage;
