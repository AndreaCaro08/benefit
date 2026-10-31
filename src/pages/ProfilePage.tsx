
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, User, Globe, Shield, MapPin, Wallet, HeartPulse } from 'lucide-react';
import { toast } from 'sonner';
import { languages } from '@/lib/languages';
import { useLanguage } from '@/lib/useLanguage';
import { getProfile, type UserProfile } from '@/lib/mockData';
import { loadProfile, persistProfile } from '@/lib/dataService';

const ProfilePage = () => {
  const { language, setLanguage } = useLanguage();
  const [profile, setProfile] = useState<UserProfile>(() => getProfile());
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadProfile()
      .then((currentProfile) => { if (active) setProfile(currentProfile); })
      .catch((error) => toast.error(error instanceof Error ? error.message : 'Unable to load your profile.'))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const updateProfile = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    const updatedProfile = {
      ...profile,
      preferred_language: language || 'en',
    };

    setSaving(true);
    try {
      await persistProfile(updatedProfile);
      setProfile(updatedProfile);
      toast.success('Profile updated!');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unable to save profile';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (code: string) => {
    setLanguage(code);
    localStorage.setItem('bb_lang', code);
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
              <Input value={profile.full_name} onChange={(event) => updateProfile('full_name', event.target.value)} className="rounded-xl h-11" required />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Phone number</Label>
              <Input type="tel" autoComplete="tel" value={profile.phone} onChange={(event) => updateProfile('phone', event.target.value)} className="rounded-xl h-11" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <CardTitle className="text-base font-display">Household and Location</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={profile.state} onChange={(event) => updateProfile('state', event.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" value={profile.district} onChange={(event) => updateProfile('district', event.target.value)} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" type="number" min="0" max="120" value={profile.age || ''} onChange={(event) => updateProfile('age', Number(event.target.value))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual-income">Annual household income (₹)</Label>
              <Input id="annual-income" type="number" min="0" value={profile.annual_income || ''} onChange={(event) => updateProfile('annual_income', Number(event.target.value))} className="rounded-xl h-11" />
            </div>
            <div className="space-y-2">
              <Label>Household group</Label>
              <Select value={profile.household_type} onValueChange={(value) => updateProfile('household_type', value as UserProfile['household_type'])}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Not provided" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">Not provided</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="family">Family</SelectItem>
                  <SelectItem value="farmer">Farmer</SelectItem>
                  <SelectItem value="senior">Senior citizen</SelectItem>
                  <SelectItem value="working">Working</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={profile.gender} onValueChange={(value) => updateProfile('gender', value as UserProfile['gender'])}>
                <SelectTrigger className="rounded-xl h-11"><SelectValue placeholder="Not provided" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">Prefer not to say / not provided</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-xl bg-muted/50 p-4">
              <div className="flex items-center gap-3">
                <HeartPulse className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Person with disability in household</p>
                  <p className="text-xs text-muted-foreground">Used only when a verified scheme rule applies.</p>
                </div>
              </div>
              <Select
                value={profile.has_disability === null ? 'unknown' : String(profile.has_disability)}
                onValueChange={(value) => updateProfile('has_disability', value === 'unknown' ? null : value === 'true')}
              >
                <SelectTrigger aria-label="Person with disability in household" className="w-40 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unknown">Not provided</SelectItem>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
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
                {languages.map((entry) => (
                  <SelectItem key={entry.code} value={entry.code}>
                    {entry.nativeName} ({entry.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button className="w-full h-11 rounded-xl font-semibold" onClick={handleSave} disabled={saving || loading || !profile.full_name.trim()}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>

        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <Shield className="w-3.5 h-3.5" />
          <Wallet className="w-3.5 h-3.5" />
          <span>Your profile is saved in this browser.</span>
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default ProfilePage;
