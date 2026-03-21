import { LogOut, Wallet, Home, FileText, Menu, X, Search, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/explore', icon: Search, label: 'Schemes' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
  { to: '/applications', icon: FileText, label: 'Applications' },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-card/70 backdrop-blur-xl border-b">
      <div className="container flex items-center justify-between h-16">
        <Link to="/home" className="flex items-center gap-2.5 font-bold text-lg font-display">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-bold">B</span>
          </div>
          <span className="hidden sm:inline text-foreground">Benefit Bridge</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-3 text-muted-foreground rounded-xl">
            <LogOut className="w-4 h-4" />
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-muted-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card/95 backdrop-blur-xl animate-fade-in">
          <nav className="container py-3 space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
