import { languages } from '@/lib/languages';
import { useLanguage } from '@/lib/useLanguage';
import { useNavigate } from 'react-router-dom';
import { Globe, Sparkles } from 'lucide-react';

const LanguageSelect = () => {
  const { setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSelect = (code: string) => {
    setLanguage(code);
    localStorage.setItem('bb_lang', code);
    navigate('/home');
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-foreground/5 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="max-w-3xl w-full">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary-foreground/10 backdrop-blur-md border border-primary-foreground/10 mb-8 animate-float">
              <Globe className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-4 tracking-tight font-display">
              Serve Sahayak
            </h1>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-secondary" />
              <p className="text-primary-foreground/60 text-lg font-light">
                Your gateway to government benefits
              </p>
              <Sparkles className="w-4 h-4 text-secondary" />
            </div>
            <p className="text-primary-foreground/40 text-sm">
              Choose your preferred language to continue
            </p>
          </div>

          {/* Language Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {languages.map((lang, i) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className="group relative flex flex-col items-center p-5 rounded-2xl bg-primary-foreground/[0.07] backdrop-blur-md border border-primary-foreground/[0.08] hover:bg-primary-foreground/[0.15] hover:border-primary-foreground/20 transition-all duration-300 hover:scale-[1.04] hover:shadow-glow animate-fade-in-scale"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="text-lg font-bold text-primary-foreground font-display">
                  {lang.nativeName}
                </span>
                <span className="text-xs text-primary-foreground/40 mt-1.5 font-light">
                  {lang.name}
                </span>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelect;
