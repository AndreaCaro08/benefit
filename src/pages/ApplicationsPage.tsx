import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Chatbot from '@/components/Chatbot';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, CheckCircle, XCircle, Eye, BarChart3 } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: any; step: number }> = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock, step: 1 },
  under_review: { label: 'Under Review', color: 'bg-info/10 text-info border-info/20', icon: Eye, step: 2 },
  approved: { label: 'Approved', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle, step: 3 },
  rejected: { label: 'Rejected', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle, step: 3 },
};

const timelineSteps = ['Submitted', 'Under Review', 'Decision'];

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<any[]>([]);
  const [schemes, setSchemes] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }
      const { data: appsData } = await supabase.from('applications').select('*').eq('user_id', user.id).order('submitted_at', { ascending: false });
      if (appsData) {
        setApps(appsData);
        const schemeIds = [...new Set(appsData.map(a => a.scheme_id))];
        if (schemeIds.length > 0) {
          const { data: sData } = await supabase.from('schemes').select('*').in('id', schemeIds);
          if (sData) {
            const map: Record<string, any> = {};
            sData.forEach(s => { map[s.id] = s; });
            setSchemes(map);
          }
        }
      }
    };
    fetch();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8 space-y-6">
        <div className="flex items-start gap-4 animate-fade-in">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-info to-info/80 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 text-info-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display">My Applications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track your application statuses</p>
          </div>
        </div>

        {/* Stats */}
        {apps.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
            {Object.entries(statusConfig).map(([key, conf]) => {
              const count = apps.filter(a => a.status === key).length;
              if (count === 0) return null;
              const Icon = conf.icon;
              return (
                <div key={key} className={`p-3.5 rounded-2xl border ${conf.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-semibold">{conf.label}</span>
                  </div>
                  <p className="text-2xl font-bold font-display">{count}</p>
                </div>
              );
            }).filter(Boolean)}
          </div>
        )}

        {apps.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground animate-fade-in">
            <FileText className="w-14 h-14 mx-auto mb-4 opacity-30" />
            <p className="font-medium">No applications yet</p>
            <p className="text-sm mt-1">Browse schemes to apply!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((app, i) => {
              const scheme = schemes[app.scheme_id];
              const sc = statusConfig[app.status] || statusConfig.pending;
              const StatusIcon = sc.icon;
              const currentStep = sc.step;

              return (
                <Card
                  key={app.id}
                  className="border-0 shadow-card hover:shadow-elevated transition-all duration-200 animate-fade-in-scale"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top row */}
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${sc.color}`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate font-display">{scheme?.name || 'Loading...'}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Applied {new Date(app.submitted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={`rounded-lg ${sc.color}`}>
                        {sc.label}
                      </Badge>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center gap-0">
                      {timelineSteps.map((step, idx) => {
                        const isCompleted = idx + 1 <= currentStep;
                        const isCurrent = idx + 1 === currentStep;
                        const isRejected = app.status === 'rejected' && idx === 2;
                        return (
                          <div key={step} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isRejected ? 'bg-destructive text-destructive-foreground' :
                                isCompleted ? 'bg-success text-success-foreground' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {isRejected ? '✗' : isCompleted ? '✓' : idx + 1}
                              </div>
                              <span className={`text-[10px] mt-1 font-medium ${
                                isCurrent ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {step}
                              </span>
                            </div>
                            {idx < timelineSteps.length - 1 && (
                              <div className={`h-0.5 flex-1 -mt-4 ${
                                idx + 1 < currentStep ? 'bg-success' : 'bg-muted'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Chatbot />
    </div>
  );
};

export default ApplicationsPage;
