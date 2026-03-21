import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import SchemeCard from '@/components/SchemeCard';
import Chatbot from '@/components/Chatbot';
import { Badge } from '@/components/ui/badge';
import { Search, FileText, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  benefits: string;
  icon: string;
  required_documents: string[];
  eligibility_criteria: any;
}

const ExploreSchemesPage = () => {
  const navigate = useNavigate();
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [walletDocs, setWalletDocs] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const [schemesRes, docsRes] = await Promise.all([
        supabase.from('schemes').select('*'),
        supabase.from('wallet_documents').select('document_type').eq('user_id', user.id),
      ]);
      if (schemesRes.data) setSchemes(schemesRes.data as Scheme[]);
      if (docsRes.data) setWalletDocs(docsRes.data.map(d => d.document_type));
    };
    fetchData();
  }, [navigate]);

  const calcEligibility = (scheme: Scheme) => {
    const required = scheme.required_documents;
    if (required.length === 0) return 100;
    const matched = required.filter(d => walletDocs.includes(d)).length;
    return Math.round((matched / required.length) * 100);
  };

  const getMissingDocs = (scheme: Scheme) => {
    return scheme.required_documents.filter(d => !walletDocs.includes(d));
  };

  const categories = [...new Set(schemes.map(s => s.category))];

  const filtered = schemes.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !selectedCategory || s.category === selectedCategory;
    return matchSearch && matchCat;
  });

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
              Discover {schemes.length} government welfare schemes
            </p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search schemes by name or description..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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
            {categories.map(cat => (
              <Badge
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className="cursor-pointer rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Badge>
            ))}
          </div>
        </div>

        {/* Schemes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((scheme, i) => (
            <div key={scheme.id} className="animate-fade-in-scale" style={{ animationDelay: `${i * 50}ms` }}>
              <SchemeCard
                scheme={scheme}
                eligibility={calcEligibility(scheme)}
                missingDocs={getMissingDocs(scheme)}
                onApply={id => navigate(`/apply/${id}`)}
                onViewDetails={id => navigate(`/scheme/${id}`)}
              />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
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
