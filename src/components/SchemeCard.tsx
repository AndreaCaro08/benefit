import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Wheat, Home, GraduationCap, Flame, Briefcase, TrendingUp, Award, FileText, Volume2, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/useLanguage';

const iconMap: Record<string, any> = {
  Heart, Wheat, Home, GraduationCap, Flame, Briefcase, TrendingUp, Award, FileText,
};

interface SchemeCardProps {
  scheme: {
    id: string;
    name: string;
    description: string;
    category: string;
    benefits: string;
    icon: string;
    required_documents: string[];
    eligibility_criteria: any;
  };
  eligibility?: number;
  missingDocs?: string[];
  onApply: (id: string) => void;
  onViewDetails: (id: string) => void;
}

const SchemeCard = ({ scheme, eligibility = 0, missingDocs = [], onApply, onViewDetails }: SchemeCardProps) => {
  const Icon = iconMap[scheme.icon] || FileText;
  const { language } = useLanguage();

  const getEligibilityColor = (pct: number) => {
    if (pct >= 80) return 'text-success';
    if (pct >= 50) return 'text-warning';
    return 'text-muted-foreground';
  };

  const getBarColor = (pct: number) => {
    if (pct >= 80) return 'bg-success';
    if (pct >= 50) return 'bg-warning';
    return 'bg-muted-foreground/30';
  };

  const speakScheme = () => {
    const utterance = new SpeechSynthesisUtterance(
      `${scheme.name}. ${scheme.description}. Benefits: ${scheme.benefits}`
    );
    utterance.lang = language || 'en';
    speechSynthesis.speak(utterance);
  };

  return (
    <Card className="group shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-0 bg-card overflow-hidden">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${eligibility >= 80 ? 'bg-success' : eligibility >= 50 ? 'bg-warning' : 'bg-muted'}`} />
      
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-accent flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm leading-tight font-display line-clamp-2">{scheme.name}</h3>
              <Badge variant="secondary" className="mt-1.5 text-[10px] font-semibold rounded-md px-2 py-0.5">{scheme.category}</Badge>
            </div>
          </div>
          <button
            onClick={speakScheme}
            className="p-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-accent transition-all shrink-0"
            title="Read aloud"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{scheme.description}</p>

        {/* Eligibility meter */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Eligibility</span>
            <span className={`font-bold ${getEligibilityColor(eligibility)}`}>{eligibility}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(eligibility)}`}
              style={{ width: `${eligibility}%` }}
            />
          </div>
        </div>

        {missingDocs.length > 0 && eligibility >= 50 && (
          <p className="text-xs text-warning bg-warning/10 rounded-lg px-3 py-2">
            Upload {missingDocs.join(', ').replace(/_/g, ' ')} to boost eligibility
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 rounded-xl h-9"
            onClick={() => onViewDetails(scheme.id)}
          >
            Details
          </Button>
          <Button
            size="sm"
            className="flex-1 rounded-xl h-9 gap-1.5"
            onClick={() => onApply(scheme.id)}
            disabled={eligibility < 50}
          >
            Apply <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SchemeCard;
