import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Globe, ArrowLeft, Shield, Sparkles } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/home');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success('Account created! Please check your email to verify.');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden flex items-center justify-center p-4">
      {/* Decorative */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary-foreground/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in-scale">
        <Card className="shadow-elevated border-0 bg-card/95 backdrop-blur-xl">
          <CardHeader className="text-center pb-2 relative">
            <button
              onClick={() => navigate('/')}
              className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mx-auto mb-4">
              <Globe className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold font-display">
              {isLogin ? 'Welcome Back' : 'Join Benefit Bridge'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin ? 'Sign in to access your benefits dashboard' : 'Create your account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    required
                    className="h-11 rounded-xl"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-11 rounded-xl"
                />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl font-semibold text-base" disabled={loading}>
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="flex items-center gap-2 justify-center mt-5 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>Your data is encrypted and secure</span>
            </div>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-semibold hover:underline"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
