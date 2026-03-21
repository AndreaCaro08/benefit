import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Globe, Shield, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { languages } from '@/lib/languages';
import { useLanguage } from '@/lib/useLanguage';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setProfile(data);
        setFullName(data.full_name || '');
      }
    };
    fetch();
  }, [navigate]);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({
      full_name: fullName,
      preferred_language: language,
    }).eq('id', profile.id);
    if (error) toast.error(error.message);
    else toast.success('Profile updated!');
    setSaving(false);
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    localStorage.setItem('bb_lang', code);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 max-w-lg space-y-6">
        <div className="flex items-start gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-muted-foreground/60 to-muted-foreground/40 flex items-center justify-center shrink-0">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">Profile & Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your account</p>
          </div>
        </div>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-display">Personal Info</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Full Name</Label>
              <Input value={fullName} onChange={e => setFullName(e.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Email</Label>
              <Input value={profile?.email || ''} disabled className="rounded-xl h-11 bg-muted" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-display">Language</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select value={language || 'en'} onValueChange={handleLanguageChange}>
              <SelectTrigger className="rounded-xl h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map(l => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.nativeName} ({l.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button className="w-full h-11 rounded-xl font-semibold" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <Shield className="w-3.5 h-3.5" />
          <span>Your data is encrypted and secure</span>
        </div>

        <Button variant="outline" className="w-full rounded-xl text-destructive hover:bg-destructive/10" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </main>
      <Chatbot />
    </div>
  );
};

export default ProfilePage;
