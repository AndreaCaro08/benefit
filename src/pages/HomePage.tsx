
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import {
  ArrowRight,
  BookOpenText,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HeartPulse,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProfile, getSchemes, type Scheme, type UserProfile } from '@/lib/mockData';
import { loadProfile, loadSchemes, loadWallet } from '@/lib/dataService';
import { toast } from 'sonner';

const categories = [
  { name: 'Education', icon: GraduationCap },
  { name: 'Healthcare', icon: HeartPulse },
  { name: 'Housing', icon: Building2 },
  { name: 'Employment', icon: BriefcaseBusiness },
  { name: 'Women & Child Welfare', icon: Users },
  { name: 'Social Welfare', icon: ShieldCheck },
];

const steps = [
  {
    title: '1. Explore schemes',
    description: 'Browse scheme records and review the official sources.',
  },
  {
    title: '2. Add your documents',
    description: 'Keep supported documents in your browser wallet to compare against published requirements.',
  },
  {
    title: '3. Check your match',
    description: 'See only source-backed document and eligibility checks. A match score is not approval probability.',
  },
];

const HomePage = () => {
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const [schemes, setSchemes] = useState<Scheme[]>(() => getSchemes());
  const [walletCount, setWalletCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const schemeCount = schemes.length;
  const userName = profile.full_name || 'Citizen';

  useEffect(() => {
    let active = true;
    Promise.all([loadProfile(), loadSchemes(), loadWallet()])
      .then(([nextProfile, catalog, documents]) => {
        if (!active) return;
        setProfile(nextProfile);
        setSchemes(catalog.schemes);
        if (catalog.notice) toast.warning(catalog.notice);
        setWalletCount(documents.length);
      })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Unable to load your dashboard data.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8 md:py-10 space-y-8">
        <section className="relative overflow-hidden rounded-[30px] bg-gradient-primary text-primary-foreground p-6 md:p-10 shadow-elevated">
          <div className="absolute -right-14 top-6 h-52 w-52 rounded-full bg-secondary/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary-foreground/10 blur-2xl" />

          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground/80">
                <Sparkles className="h-3.5 w-3.5" />
                Your Guide to Government Benefits
              </div>

              <h1 className="max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
                Welcome, {userName}! 👋
              </h1>

              <p className="mt-4 max-w-xl text-base text-primary-foreground/75 md:text-lg">
                Explore schemes, check your documents against verified criteria, and follow official links for application instructions.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/explore" className="inline-flex items-center gap-2 rounded-xl bg-primary-foreground px-5 py-3 text-sm font-semibold text-primary shadow-sm transition hover:opacity-90">
                  Find My Schemes
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/wallet" className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10">
                  My Document Wallet
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 text-sm text-primary-foreground/75">
                <div>
                  <div className="text-2xl font-bold text-primary-foreground">{schemeCount}</div>
                  <div>scheme records</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary-foreground">{walletCount}</div>
                  <div>documents</div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-primary-foreground/10 bg-primary-foreground/[0.06] p-5 backdrop-blur-sm">
              <div className="rounded-2xl bg-card p-4 text-foreground shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                      <Search className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Quick benefit check</p>
                      <p className="text-xs text-muted-foreground">Profile checks stay on this device</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">Private</span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Household group</p>
                    <p className="mt-1 font-medium capitalize">{profile.household_type}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="mt-1 font-medium">{[profile.district, profile.state].filter(Boolean).join(', ') || 'Add your location'}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">Published scheme records</p>
                    <p className="mt-1 font-medium">{schemes.filter((scheme) => scheme.is_published && scheme.verification_status === 'published' && scheme.last_verified_at).length}</p>
                  </div>
                </div>

                <Link to="/explore" className="mt-5 flex items-center justify-between rounded-xl bg-muted p-3 text-sm font-medium text-foreground">
                  {loading ? 'Updating your dashboard…' : 'Explore and check your scheme match'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">Browse categories</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Explore schemes by need</h2>
            </div>
            <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              View all schemes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map(({ name, icon: Icon }) => (
              <div key={name} className="rounded-2xl border border-border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-elevated">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">Aid, guidance and official links for support programs in this category.</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-card p-6 shadow-card md:p-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">How it works</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Simple guidance, clearer access</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl bg-muted/50 p-5">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">{step.title.split('.')[0]}</div>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">Featured schemes</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Popular support programs</h2>
            </div>
            <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Explore all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {schemes.slice(0, 3).map((scheme) => (
              <div key={scheme.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="mb-3 inline-flex items-center rounded-full bg-warning/10 px-2.5 py-1 text-xs font-semibold text-warning">Draft • verification pending</div>
                <h3 className="text-xl font-semibold">{scheme.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Official eligibility, benefits, and document requirements are not yet published in this record.</p>
                <div className="mt-5 flex items-center justify-between text-sm font-medium">
                  <span className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4" /> Not verified</span>
                  <Link to={`/scheme/${scheme.id}`} className="text-primary">Review record</Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-border bg-card p-6 shadow-card md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">Trusted guidance</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Built for clarity, privacy and trust</h2>
            <div className="mt-6 space-y-4">
              <div className="flex gap-3 rounded-2xl bg-muted/40 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Secure document handling</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Your uploads stay in this browser. No government department receives them here.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-2xl bg-muted/40 p-4">
                <BookOpenText className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Careful scheme matching</h3>
                  <p className="mt-1 text-sm text-muted-foreground">A match score uses only verified criteria. It is not approval probability or a guarantee.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-2xl bg-muted/40 p-4">
                <Wallet className="mt-0.5 h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">One place for your essentials</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Keep your identity, income, resident, education and health documents ready for scheme checks.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground shadow-elevated md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary-foreground/70">Important note</p>
            <h3 className="mt-2 text-2xl font-bold">Apply through official channels.</h3>
            <p className="mt-3 text-sm leading-6 text-primary-foreground/80">Serve Sahayak does not submit applications or determine eligibility. Review verified requirements and use the official scheme links to apply.</p>
          </div>
        </section>

      </main>

      <footer className="border-t border-border bg-card">
        <div className="container flex flex-col gap-4 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <div>
          <div className="font-semibold text-foreground">Serve Sahayak</div>
            <p>Your Guide to Government Benefits</p>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link to="/explore">Explore schemes</Link>
            <Link to="/wallet">Document wallet</Link>
            <Link to="/admin">Admin</Link>
            <Link to="/profile">Profile</Link>
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
};

export default HomePage;
