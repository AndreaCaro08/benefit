
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SchemeCard from '@/components/SchemeCard';
import Chatbot from '@/components/Chatbot';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { evaluateSchemeMatch, getProfile, type Scheme, type UserProfile } from '@/lib/mockData';
import { loadProfile, loadSchemes, loadWallet } from '@/lib/dataService';
import { toast } from 'sonner';

const ExploreSchemesPage = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [walletDocs, setWalletDocs] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([loadSchemes(), loadWallet(), loadProfile()])
      .then(([catalog, documents, nextProfile]) => {
        setSchemes(catalog.schemes);
        setCatalogNotice(catalog.notice);
        setWalletDocs(documents.map((doc) => doc.document_type));
        setProfile(nextProfile);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Unable to load your scheme data.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [...new Set(schemes.map((scheme) => scheme.category))], [schemes]);

  const filtered = useMemo(() => {
    return schemes
      .filter((scheme) => {
        const matchSearch =
          scheme.name.toLowerCase().includes(search.toLowerCase()) ||
          scheme.description.toLowerCase().includes(search.toLowerCase()) ||
          scheme.benefits.toLowerCase().includes(search.toLowerCase());
        const matchCategory = !selectedCategory || scheme.category === selectedCategory;
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        const scoreA = evaluateSchemeMatch(a, profile, walletDocs).documentEligibilityScore ?? -1;
        const scoreB = evaluateSchemeMatch(b, profile, walletDocs).documentEligibilityScore ?? -1;
        return scoreB - scoreA;
      });
  }, [schemes, search, selectedCategory, walletDocs, profile]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        <div className="flex items-start gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">Explore Schemes</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {schemes.length} scheme records • {schemes.filter((scheme) => scheme.is_published && scheme.verification_status === 'published' && scheme.last_verified_at).length} verified and published
            </p>
          </div>
        </div>

        {catalogNotice && (
          <div role="status" className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
            {catalogNotice}
          </div>
        )}

        <div role="note" className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          Draft schemes may show document-match estimates using example documents. These documents and percentages are not verified government requirements or approval predictions. Add documents in your wallet to try the estimate.
        </div>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search schemes by name or benefit..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-11 h-11 rounded-xl border-0 bg-card shadow-card"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={!selectedCategory ? 'default' : 'outline'}
              className="cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading scheme records…</div>
        ) : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((scheme, index) => (
            <div key={scheme.id} className="animate-fade-in-scale" style={{ animationDelay: `${index * 50}ms` }}>
              <SchemeCard
                scheme={scheme}
                match={evaluateSchemeMatch(scheme, profile, walletDocs)}
                onViewDetails={(id) => navigate(`/scheme/${id}`)}
                onAddDocuments={() => navigate('/wallet')}
              />
            </div>
          ))}
        </div>}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <FileText className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No schemes found.</p>
            <p className="text-sm mt-1">Try a different search or category</p>
          </div>
        )}
      </main>
      <Chatbot />
    </div>
  );
};

export default ExploreSchemesPage;
