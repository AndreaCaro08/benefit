import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Wallet, Search, FileText, Settings, ArrowRight, Shield, CheckCircle, Sparkles, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [walletCount, setWalletCount] = useState(0);
  const [appCount, setAppCount] = useState(0);
  const [schemeCount, setSchemeCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      const [profileRes, docsRes, appsRes, schemesRes] = await Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('wallet_documents').select('id').eq('user_id', user.id),
        supabase.from('applications').select('id').eq('user_id', user.id),
        supabase.from('schemes').select('id'),
      ]);

      if (profileRes.data?.full_name) setUserName(profileRes.data.full_name);
      if (docsRes.data) setWalletCount(docsRes.data.length);
      if (appsRes.data) setAppCount(appsRes.data.length);
      if (schemesRes.data) setSchemeCount(schemesRes.data.length);
    };
    fetchData();
  }, [navigate]);

  const features = [
    {
      icon: Wallet,
      title: 'My Wallet',
      description: 'Upload & manage documents. Fetch from DigiLocker.',
      stat: `${walletCount} docs`,
      to: '/wallet',
      gradient: 'from-primary to-primary/80',
    },
    {
      icon: Search,
      title: 'Explore Schemes',
      description: 'Discover government welfare schemes you qualify for.',
      stat: `${schemeCount} schemes`,
      to: '/explore',
      gradient: 'from-secondary to-secondary/80',
    },
    {
      icon: BarChart3,
      title: 'My Applications',
      description: 'Track application status with real-time updates.',
      stat: `${appCount} active`,
      to: '/applications',
      gradient: 'from-info to-info/80',
    },
    {
      icon: Settings,
      title: 'Profile & Settings',
      description: 'Manage language, profile, and preferences.',
      stat: '',
      to: '/profile',
      gradient: 'from-muted-foreground/60 to-muted-foreground/40',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-8">
        {/* Welcome Hero */}
        <div className="relative overflow-hidden bg-gradient-primary rounded-3xl p-8 md:p-10 text-primary-foreground animate-fade-in">
          <div className="absolute top-0 right-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-secondary" />
              <span className="text-sm text-primary-foreground/60 font-medium">AI-Powered Platform</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold font-display mb-2">
              Welcome{userName ? `, ${userName}` : ''}! 👋
            </h1>
            <p className="text-primary-foreground/60 text-base max-w-lg">
              Your one-stop platform for discovering and applying to government welfare schemes with AI-powered eligibility detection.
            </p>
          </div>
        </div>

        {/* Security Banner */}
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-2xl animate-fade-in">
          <Shield className="w-5 h-5 text-success shrink-0" />
          <span className="text-sm font-medium text-foreground">
            🔒 Your data is सुरक्षित and encrypted • Secured via DigiLocker Integration
          </span>
          <CheckCircle className="w-4 h-4 text-success ml-auto shrink-0" />
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <Link
              key={f.to}
              to={f.to}
              className="group block animate-fade-in-scale"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="relative overflow-hidden bg-card rounded-2xl shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 p-6 h-full border-0">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center shadow-sm`}>
                    <f.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  {f.stat && (
                    <span className="text-xs font-bold text-muted-foreground bg-muted rounded-lg px-3 py-1.5">
                      {f.stat}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold font-display mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {f.description}
                </p>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  Open <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default HomePage;
