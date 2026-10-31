import { FormEvent, useMemo, useState } from 'react';
import { Pencil, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { saveLocalSchemeCatalog } from '@/lib/dataService';
import { getSchemes, type Scheme } from '@/lib/mockData';
import { toast } from 'sonner';

type SchemeForm = {
  id: string;
  name: string;
  name_ta: string;
  description: string;
  description_ta: string;
  category: string;
  benefits: string;
  benefits_ta: string;
  government_level: string;
  state: string;
  department: string;
  official_link: string;
  application_url: string;
  source_urls: string;
  required_documents: string;
  eligibility_rules: string;
  verification_status: Scheme['verification_status'];
  last_verified_at: string;
  translation_status: Scheme['translation_status'];
};

const blankForm = (): SchemeForm => ({
  id: '',
  name: '',
  name_ta: '',
  description: '',
  description_ta: '',
  category: '',
  benefits: '',
  benefits_ta: '',
  government_level: '',
  state: '',
  department: '',
  official_link: '',
  application_url: '',
  source_urls: '',
  required_documents: '',
  eligibility_rules: '[]',
  verification_status: 'draft',
  last_verified_at: '',
  translation_status: 'unverified',
});

const formFromScheme = (scheme: Scheme): SchemeForm => ({
  id: scheme.id,
  name: scheme.name,
  name_ta: scheme.name_ta,
  description: scheme.description,
  description_ta: scheme.description_ta,
  category: scheme.category,
  benefits: scheme.benefits,
  benefits_ta: scheme.benefits_ta,
  government_level: scheme.government_level,
  state: scheme.state,
  department: scheme.department,
  official_link: scheme.official_link,
  application_url: scheme.application_url || '',
  source_urls: scheme.source_urls.join('\n'),
  required_documents: scheme.required_documents.join('\n'),
  eligibility_rules: JSON.stringify(scheme.eligibility_rules, null, 2),
  verification_status: scheme.verification_status,
  last_verified_at: scheme.last_verified_at || '',
  translation_status: scheme.translation_status,
});

const toHttpUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

const supportedRuleFields = new Set([
  'age',
  'annual_income',
  'district',
  'gender',
  'has_disability',
  'household_type',
  'state',
]);

const AdminSchemesPage = () => {
  const [schemes, setSchemes] = useState<Scheme[]>(() => getSchemes());
  const [form, setForm] = useState<SchemeForm>(blankForm);

  const sortedSchemes = useMemo(
    () => [...schemes].sort((a, b) => a.name.localeCompare(b.name)),
    [schemes],
  );

  const setField = <K extends keyof SchemeForm>(key: K, value: SchemeForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const slug = form.id.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      toast.error('Use a lowercase scheme ID with letters, numbers, and hyphens.');
      return;
    }
    const sourceUrls = form.source_urls.split(/\r?\n/).map((value) => value.trim()).filter(Boolean);
    if (sourceUrls.some((url) => !toHttpUrl(url))) {
      toast.error('Every source link must be a valid HTTP or HTTPS URL.');
      return;
    }
    if (form.application_url.trim() && !toHttpUrl(form.application_url.trim())) {
      toast.error('Application link must be a valid HTTP or HTTPS URL.');
      return;
    }

    let eligibilityRules: Scheme['eligibility_rules'];
    try {
      const parsed: unknown = JSON.parse(form.eligibility_rules);
      if (!Array.isArray(parsed)) throw new Error('Eligibility rules must be a JSON array.');
      const supportedOperators = new Set(['equals', 'in', 'exists', 'unknown', 'gte', 'lte']);
      eligibilityRules = parsed.map((candidate) => {
        if (!candidate || typeof candidate !== 'object') throw new Error('Each eligibility rule must be an object.');
        const rule = candidate as Record<string, unknown>;
        if (
          typeof rule.field !== 'string'
          || !supportedRuleFields.has(rule.field)
          || typeof rule.operator !== 'string'
          || !supportedOperators.has(rule.operator)
          || typeof rule.value !== 'string'
          || typeof rule.source_url !== 'string'
          || !toHttpUrl(rule.source_url)
          || (rule.required !== undefined && typeof rule.required !== 'boolean')
        ) {
          throw new Error('Each rule needs a field, supported operator, string value, official source_url, and optional required boolean.');
        }
        return {
          field: rule.field,
          operator: rule.operator as Scheme['eligibility_rules'][number]['operator'],
          value: rule.value,
          source_url: rule.source_url,
          required: rule.required as boolean | undefined,
        };
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Eligibility rules must be valid JSON.');
      return;
    }

    const verificationDate = form.last_verified_at || null;
    const publish = form.verification_status === 'published';
    if (publish && (
      !verificationDate
      || sourceUrls.length === 0
      || !eligibilityRules.some((rule) => rule.operator !== 'unknown')
    )) {
      toast.error('Before publishing, provide a verification date, official source, and structured eligibility rules.');
      return;
    }

    const scheme: Scheme = {
      id: slug,
      name: form.name.trim(),
      name_ta: form.name_ta.trim(),
      description: form.description.trim(),
      description_ta: form.description_ta.trim(),
      category: form.category.trim(),
      benefits: form.benefits.trim(),
      benefits_ta: form.benefits_ta.trim(),
      icon: schemes.find((item) => item.id === slug)?.icon || 'FileText',
      government_level: form.government_level.trim() || 'Unknown',
      state: form.state.trim() || 'Unknown',
      department: form.department.trim() || 'Unknown',
      eligibility_criteria: eligibilityRules.map((rule) => `${rule.field} ${rule.operator} ${rule.value}`),
      eligibility_rules: eligibilityRules,
      required_documents: form.required_documents.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
      official_link: sourceUrls[0] || '',
      application_url: form.application_url.trim() || null,
      source: sourceUrls.length ? 'Official sources recorded' : 'Unknown',
      source_url: sourceUrls[0] || '',
      source_urls: sourceUrls,
      verification_status: form.verification_status,
      last_verified_at: verificationDate,
      is_published: publish,
      translation_status: form.translation_status,
    };

    try {
      const updatedSchemes = [
        ...schemes.filter((item) => item.id !== scheme.id),
        scheme,
      ];
      saveLocalSchemeCatalog(updatedSchemes);
      setSchemes(updatedSchemes);
      toast.success('Scheme saved in this browser.');
      setForm(blankForm());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save scheme.');
    }
  };

  const handleDelete = (scheme: Scheme) => {
    if (!window.confirm(`Delete "${scheme.name}" from this browser?`)) return;
    try {
      const updatedSchemes = schemes.filter((item) => item.id !== scheme.id);
      saveLocalSchemeCatalog(updatedSchemes);
      setSchemes(updatedSchemes);
      if (form.id === scheme.id) setForm(blankForm());
      toast.success('Scheme deleted from this browser.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to delete scheme.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-6xl space-y-6 py-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Scheme Admin</h1>
              <p className="mt-1 text-sm text-muted-foreground">Add, update, and remove scheme records without signing in.</p>
            </div>
          </div>
        </div>

        <div role="status" className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          No sign-in or database connection is required. Scheme changes are saved only in this browser and are not shared with other users. Treat match scores as guidance, not approval probabilities.
        </div>

            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">{schemes.length} scheme records in this browser</p>
              <Button onClick={() => setForm(blankForm())}><Plus className="h-4 w-4" /> New scheme</Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
              <Card>
                <CardHeader><CardTitle className="text-lg">Scheme catalogue</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {sortedSchemes.map((scheme) => (
                    <div key={scheme.id} className="flex items-center gap-3 rounded-xl border p-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{scheme.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{scheme.category} · {scheme.state}</p>
                      </div>
                      <Badge variant={scheme.is_published ? 'default' : 'outline'}>
                        {scheme.is_published ? 'Published' : scheme.verification_status}
                      </Badge>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${scheme.name}`} onClick={() => setForm(formFromScheme(scheme))}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Delete ${scheme.name}`} onClick={() => handleDelete(scheme)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  {schemes.length === 0 && <p className="text-sm text-muted-foreground">No scheme records yet. Add one using the form.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Pencil className="h-4 w-4" />{form.id ? 'Edit scheme' : 'Add scheme'}</CardTitle></CardHeader>
                <CardContent>
                  <form className="space-y-3" onSubmit={handleSave}>
                    <Field label="Scheme ID / slug" value={form.id} onChange={(value) => setField('id', value)} required disabled={schemes.some((scheme) => scheme.id === form.id)} />
                    <Field label="Scheme name (English)" value={form.name} onChange={(value) => setField('name', value)} required />
                    <Field label="Scheme name (Tamil)" value={form.name_ta} onChange={(value) => setField('name_ta', value)} />
                    <Field label="Category" value={form.category} onChange={(value) => setField('category', value)} required />
                    <Field label="Government level" value={form.government_level} onChange={(value) => setField('government_level', value)} />
                    <Field label="State / region" value={form.state} onChange={(value) => setField('state', value)} />
                    <Field label="Department" value={form.department} onChange={(value) => setField('department', value)} />
                    <TextField label="Description" value={form.description} onChange={(value) => setField('description', value)} />
                    <TextField label="Description (Tamil)" value={form.description_ta} onChange={(value) => setField('description_ta', value)} />
                    <TextField label="Benefits (officially sourced)" value={form.benefits} onChange={(value) => setField('benefits', value)} />
                    <TextField label="Benefits (Tamil)" value={form.benefits_ta} onChange={(value) => setField('benefits_ta', value)} />
                    <Field label="Official application URL (leave blank if unknown)" value={form.application_url} onChange={(value) => setField('application_url', value)} type="url" />
                    <TextField label="Official source URLs (one per line)" value={form.source_urls} onChange={(value) => setField('source_urls', value)} />
                    <TextField label="Required document IDs (one per line)" value={form.required_documents} onChange={(value) => setField('required_documents', value)} />
                    <TextField
                      label="Structured eligibility rules (JSON)"
                      value={form.eligibility_rules}
                      onChange={(value) => setField('eligibility_rules', value)}
                      help='Each rule: {"field":"age","operator":"gte","value":"18","source_url":"https://official.gov/...","required":true}. Operators: equals, in (use | between values), exists, gte, lte, unknown.'
                    />
                    <Field label="Last verified date" value={form.last_verified_at} onChange={(value) => setField('last_verified_at', value)} type="date" />
                    <label className="block space-y-1.5 text-sm font-medium">
                      Verification status
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.verification_status} onChange={(event) => setField('verification_status', event.target.value as Scheme['verification_status'])}>
                        <option value="draft">Draft</option>
                        <option value="pending_admin_verification">Pending admin verification</option>
                        <option value="published">Published</option>
                      </select>
                    </label>
                    <label className="block space-y-1.5 text-sm font-medium">
                      Tamil translation status
                      <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.translation_status} onChange={(event) => setField('translation_status', event.target.value as Scheme['translation_status'])}>
                        <option value="unverified">Unverified</option>
                        <option value="verified">Verified</option>
                      </select>
                    </label>
                    <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                      Publishing requires an official source, verification date, and at least one source-backed structured eligibility rule. This is a match score, not approval probability.
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1"><Save className="h-4 w-4" />Save scheme</Button>
                      <Button type="button" variant="outline" onClick={() => setForm(blankForm())}>Clear</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
      </main>
    </div>
  );
};

const Field = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) => (
  <label className="block space-y-1.5 text-sm font-medium">
    {label}
    <Input type={type} required={required} disabled={disabled} value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
);

const TextField = ({
  label,
  value,
  onChange,
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}) => (
  <label className="block space-y-1.5 text-sm font-medium">
    {label}
    <Textarea value={value} onChange={(event) => onChange(event.target.value)} />
    {help && <span className="block text-xs font-normal text-muted-foreground">{help}</span>}
  </label>
);

export default AdminSchemesPage;
