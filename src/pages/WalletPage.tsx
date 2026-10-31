
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { documentTypes } from '@/lib/languages';
import { Upload, FileCheck, Trash2, Wallet, ShieldCheck, Lock, AlertTriangle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_WALLET_DOCUMENTS, type WalletDoc } from '@/lib/mockData';
import { getWalletFileUrl, loadWallet, removeWalletFile, uploadWalletFile } from '@/lib/dataService';

const WalletPage = () => {
  const [docs, setDocs] = useState<WalletDoc[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadWallet()
      .then((documents) => { if (active) setDocs(documents); })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Unable to load documents.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleUpload = (docTypeId: string, docLabel: string) => {
    if (docs.length >= MAX_WALLET_DOCUMENTS && !docs.some((doc) => doc.document_type === docTypeId)) {
      toast.error(`Your wallet can hold up to ${MAX_WALLET_DOCUMENTS} documents. Remove a document or replace an existing one to continue.`);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setUploading(docTypeId);
      try {
        const uploaded = await uploadWalletFile(docTypeId, file);
        setDocs((current) => [uploaded, ...current.filter((doc) => doc.document_type !== docTypeId)]);
        toast.success(`${docLabel} saved in this browser.`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to upload this document.');
      } finally {
        setUploading(null);
      }
    };
    input.click();
  };

  const handleDelete = async (document: WalletDoc) => {
    try {
      await removeWalletFile(document);
      setDocs((current) => current.filter((doc) => doc.id !== document.id));
      toast.success('Document removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to remove this document.');
    }
  };

  const handleOpen = async (document: WalletDoc) => {
    try {
      const url = await getWalletFileUrl(document);
      window.open(url, '_blank', 'noopener,noreferrer');
      if (url.startsWith('blob:')) window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to open this document.');
    }
  };

  const uploadedCount = docs.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        <div className="flex items-start gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display">My Wallet</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Add documents for matching against published scheme requirements</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/10 rounded-2xl animate-fade-in">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground">
            On-device storage • Your files stay in this browser
          </span>
          <ShieldCheck className="w-4 h-4 text-primary ml-auto shrink-0" />
        </div>

        <div className="bg-card rounded-2xl p-5 shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Wallet documents</span>
            </div>
            <span className="text-sm font-bold text-primary">{uploadedCount}/{MAX_WALLET_DOCUMENTS} max</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-700"
              style={{ width: `${Math.min(uploadedCount / MAX_WALLET_DOCUMENTS, 1) * 100}%` }}
            />
          </div>
          {uploadedCount >= MAX_WALLET_DOCUMENTS && (
            <p className="mt-2 text-xs text-muted-foreground">Maximum reached. Remove a document or replace an existing one to upload a different type.</p>
          )}
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading your secure documents…</div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((documentType, index) => {
            const uploaded = docs.find((doc) => doc.document_type === documentType.id);

            return (
              <Card
                key={documentType.id}
                className={`transition-all duration-300 border-0 shadow-card hover:shadow-elevated animate-fade-in-scale ${
                  uploaded ? 'ring-1 ring-primary/20' : ''
                }`}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm font-display">{documentType.label}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{documentType.description}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-0.5">🏢 {documentType.issuer}</p>
                    </div>

                    {uploaded ? (
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-primary/10">
                        <FileCheck className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2">
                    {uploaded ? (
                      <>
                        <p className="text-[11px] text-muted-foreground">
                          {uploaded.document_name} • {new Date(uploaded.uploaded_at).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="icon" className="rounded-xl h-9 w-9" onClick={() => handleOpen(uploaded)} aria-label={`View ${documentType.label}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9" onClick={() => handleUpload(documentType.id, documentType.label)} disabled={uploading === documentType.id}>
                            {uploading === documentType.id ? 'Uploading...' : 'Replace'}
                          </Button>
                          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9" onClick={() => handleDelete(uploaded)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full rounded-xl h-9 gap-2"
                        onClick={() => handleUpload(documentType.id, documentType.label)}
                        disabled={docs.length >= MAX_WALLET_DOCUMENTS}
                      >
                        <Upload className="w-4 h-4" /> Upload
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}
      </main>
      <Chatbot />
    </div>
  );
};

export default WalletPage;
