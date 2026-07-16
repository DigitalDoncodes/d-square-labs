import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Plus, Save, Trash2, Sparkles, ChevronDown, ChevronUp, Loader2, Layout } from 'lucide-react';
import { DAX_CAPABILITY } from '../utils/dax';
import { getMyResume, saveResume } from '../api/resume';
import { reviewResume } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import { FeedSkeleton } from '../components/common/Skeleton';
import TierGate from '../components/common/TierGate';
import AIBadge from '../components/common/AIBadge';
import CrownBadge from '../components/common/CrownBadge';
import Button from '../components/common/Button';

function AIReviewPanel() {
  const [state, setState] = useState('idle');
  const [result, setResult] = useState(null);
  const [open, setOpen] = useState(true);

  const run = async () => {
    setState('loading');
    try {
      const res = await reviewResume();
      setResult(res.data);
      setState('done');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Dax could not review your resume');
      setState('error');
    }
  };

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={run}
        className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-800/60 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50"
      >
        <Sparkles className="h-4 w-4" /> Review with Dax
      </button>
    );
  }

  if (state === 'loading') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-600 dark:border-violet-800/60 dark:bg-violet-900/30 dark:text-violet-300">
        <Loader2 className="h-4 w-4 animate-spin" /> Analysing your resume…
      </div>
    );
  }

  if (state === 'error') {
    return (
      <button
        type="button"
        onClick={run}
        className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-900/30"
      >
        <Sparkles className="h-4 w-4" /> Ask Dax again
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50 dark:border-violet-800/60 dark:bg-violet-900/20">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-violet-700 dark:text-violet-300">
          <Sparkles className="h-4 w-4" /> Dax Review
          <AIBadge provider={result?._meta?.provider} confidence={result?._meta?.confidence} />
        </span>
        {open ? <ChevronUp className="h-4 w-4 text-violet-500" /> : <ChevronDown className="h-4 w-4 text-violet-500" />}
      </button>

      {open && (
        <div className="border-t border-violet-200/70 px-4 pb-4 pt-3 dark:border-violet-800/40">
          <p className="mb-4 text-sm text-gray-700 dark:text-gray-200">{result.overallImpression}</p>

          {result.improvements?.length > 0 && (
            <>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                Suggested improvements
              </p>
              <div className="space-y-3">
                {result.improvements.map((item, i) => (
                  <div key={i} className="rounded-lg border border-violet-100 bg-white p-3 dark:border-violet-900/40 dark:bg-gray-900/50">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                      {item.area}
                    </p>
                    <p className="mb-1 text-sm text-gray-700 dark:text-gray-300">{item.issue}</p>
                    <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">→ {item.fix}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

const emptyForm = {
  personal: { fullName: '', email: '', phone: '', location: '', linkedin: '', website: '' },
  summary: '',
  education: [{ degree: '', institution: '', years: '', score: '' }],
  experience: [],
  projects: [],
  certifications: [],
  skillsText: '',
  achievementsText: '',
  leadershipText: '',
};

const lines = (text) =>
  text.split('\n').map((l) => l.trim()).filter(Boolean);

function Section({ title, hint, children }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mb-3 text-xs text-gray-400">{hint}</p>}
      {!hint && <div className="mb-3" />}
      {children}
    </section>
  );
}

function EntryList({ label, fields, onAdd, onRemove, children }) {
  return (
    <div className="space-y-4">
      {fields.map((field, i) => (
        <div key={field.id} className="rounded-lg border border-gray-100 p-3 dark:border-gray-800">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">
              {label} {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemove(i)}
              aria-label={`Remove ${label} ${i + 1}`}
              className="rounded p-1 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {children(i)}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
      >
        <Plus className="h-4 w-4" /> Add {label.toLowerCase()}
      </button>
    </div>
  );
}

export default function ResumePage() {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const { register, handleSubmit, control, reset, formState } = useForm({ defaultValues: emptyForm });

  const education = useFieldArray({ control, name: 'education' });
  const experience = useFieldArray({ control, name: 'experience' });
  const projects = useFieldArray({ control, name: 'projects' });
  const certifications = useFieldArray({ control, name: 'certifications' });

  useEffect(() => {
    getMyResume().then((res) => {
      const r = res.data;
      if (r) {
        reset({
          personal: { ...emptyForm.personal, ...r.personal },
          summary: r.summary || '',
          education: r.education?.length ? r.education : emptyForm.education,
          experience: r.experience || [],
          projects: r.projects || [],
          certifications: r.certifications || [],
          skillsText: (r.skills || []).join('\n'),
          achievementsText: (r.achievements || []).join('\n'),
          leadershipText: (r.leadership || []).join('\n'),
        });
      } else {
        reset({
          ...emptyForm,
          personal: { ...emptyForm.personal, fullName: user?.name || '', email: user?.email || '' },
        });
      }
      setLoaded(true);
    });
  }, [reset, user]);

  const onSave = async (data) => {
    try {
      const { skillsText, achievementsText, leadershipText, ...rest } = data;
      await saveResume({
        ...rest,
        skills: lines(skillsText),
        achievements: lines(achievementsText),
        leadership: lines(leadershipText),
      });
      toast.success('Resume saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save resume');
    }
  };

  if (!loaded) return <div className="mx-auto max-w-3xl px-4 py-6"><FeedSkeleton count={6} /></div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">Resume Builder</h1>
          <p className="text-xs text-gray-400">
            Fill in your details, save, then preview & download as PDF
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/career/resume/preview"
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <Eye className="h-4 w-4" /> Preview
          </Link>
          <button
            type="button"
            onClick={() => document.getElementById('resume-templates')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <Layout className="h-4 w-4" /> Templates
          </button>
          <Button
            size="sm"
            onClick={handleSubmit(onSave)}
            disabled={formState.isSubmitting}
            loading={formState.isSubmitting}
            icon={Save}
          >
            {formState.isSubmitting ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <form id="resume-form" onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Section title="Personal details">
          <div className="grid gap-3 sm:grid-cols-2">
            <input {...register('personal.fullName')} placeholder="Full name" aria-label="Full name" className="input" />
            <input {...register('personal.email')} placeholder="Email" aria-label="Email" className="input" />
            <input {...register('personal.phone')} placeholder="Phone" aria-label="Phone" className="input" />
            <input {...register('personal.location')} placeholder="City, State" aria-label="Location" className="input" />
            <input {...register('personal.linkedin')} placeholder="LinkedIn URL" aria-label="LinkedIn URL" className="input" />
            <input {...register('personal.website')} placeholder="Portfolio/website (optional)" aria-label="Website" className="input" />
          </div>
        </Section>

        <Section title="Professional summary" hint="2–3 lines. Who you are, your focus area, what you bring.">
          <textarea
            {...register('summary')}
            rows={3}
            placeholder="MBA candidate specialising in Finance with experience in…"
            aria-label="Professional summary"
            className="input"
          />
        </Section>

        <Section title="Education">
          <EntryList
            label="Education"
            fields={education.fields}
            onAdd={() => education.append({ degree: '', institution: '', years: '', score: '' })}
            onRemove={education.remove}
          >
            {(i) => (
              <div className="grid gap-3 sm:grid-cols-2">
                <input {...register(`education.${i}.degree`)} placeholder="Degree (e.g. MBA — Finance)" aria-label="Degree" className="input" />
                <input {...register(`education.${i}.institution`)} placeholder="Institution" aria-label="Institution" className="input" />
                <input {...register(`education.${i}.years`)} placeholder="Years (e.g. 2025–2027)" aria-label="Years" className="input" />
                <input {...register(`education.${i}.score`)} placeholder="CGPA / % (optional)" aria-label="Score" className="input" />
              </div>
            )}
          </EntryList>
        </Section>

        <Section title="Experience & internships" hint="Use action verbs and numbers: 'Increased engagement 30% by…'">
          <EntryList
            label="Experience"
            fields={experience.fields}
            onAdd={() => experience.append({ role: '', organization: '', duration: '', description: '' })}
            onRemove={experience.remove}
          >
            {(i) => (
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <input {...register(`experience.${i}.role`)} placeholder="Role" aria-label="Role" className="input" />
                  <input {...register(`experience.${i}.organization`)} placeholder="Company / Organization" aria-label="Organization" className="input" />
                  <input {...register(`experience.${i}.duration`)} placeholder="Duration (e.g. May–Jul 2026)" aria-label="Duration" className="input" />
                </div>
                <textarea
                  {...register(`experience.${i}.description`)}
                  rows={3}
                  placeholder={'One bullet per line:\nAnalysed sales data for 3 regions…\nPresented findings to senior management…'}
                  aria-label="Description"
                  className="input"
                />
              </div>
            )}
          </EntryList>
        </Section>

        <Section title="Projects">
          <EntryList
            label="Project"
            fields={projects.fields}
            onAdd={() => projects.append({ title: '', description: '', link: '' })}
            onRemove={projects.remove}
          >
            {(i) => (
              <div className="grid gap-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <input {...register(`projects.${i}.title`)} placeholder="Project title" aria-label="Project title" className="input" />
                  <input {...register(`projects.${i}.link`)} placeholder="Link (optional)" aria-label="Project link" className="input" />
                </div>
                <textarea
                  {...register(`projects.${i}.description`)}
                  rows={2}
                  placeholder="What it was, what you did, the result"
                  aria-label="Project description"
                  className="input"
                />
              </div>
            )}
          </EntryList>
        </Section>

        <Section title="Skills" hint="One skill per line (e.g. Financial Modelling, Excel, Power BI, SQL)">
          <textarea {...register('skillsText')} rows={4} aria-label="Skills" className="input" />
        </Section>

        <Section title="Certifications">
          <EntryList
            label="Certification"
            fields={certifications.fields}
            onAdd={() => certifications.append({ name: '', issuer: '', year: '' })}
            onRemove={certifications.remove}
          >
            {(i) => (
              <div className="grid gap-3 sm:grid-cols-3">
                <input {...register(`certifications.${i}.name`)} placeholder="Certification" aria-label="Certification name" className="input" />
                <input {...register(`certifications.${i}.issuer`)} placeholder="Issuer" aria-label="Issuer" className="input" />
                <input {...register(`certifications.${i}.year`)} placeholder="Year" aria-label="Year" className="input" />
              </div>
            )}
          </EntryList>
        </Section>

        <Section title="Achievements" hint="One per line — awards, ranks, competitions">
          <textarea {...register('achievementsText')} rows={3} aria-label="Achievements" className="input" />
        </Section>

        <Section title="Leadership & extracurricular" hint="One per line — clubs, committees, volunteering">
          <textarea {...register('leadershipText')} rows={3} aria-label="Leadership and extracurricular" className="input" />
        </Section>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={formState.isSubmitting}
            loading={formState.isSubmitting}
            icon={Save}
          >
            {formState.isSubmitting ? 'Saving…' : 'Save resume'}
          </Button>
        </div>
      </form>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{DAX_CAPABILITY.resumeReview}</span>
          <CrownBadge required="pro" />
        </div>
        <TierGate required="pro" description="Professional ATS analysis and targeted improvements from Dax — specific to your resume sections, not generic advice.">
          <p className="mb-2 text-xs text-gray-400">Save your resume first, then Dax can review it.</p>
          <AIReviewPanel />
        </TierGate>
      </div>

      {/* Resume Templates */}
      <div id="resume-templates" className="mt-8 scroll-mt-6">
        <div className="mb-4 flex items-center gap-2">
          <Layout className="h-4 w-4 text-indigo-500" />
          <h2 className="text-base font-semibold">Resume Design Templates</h2>
        </div>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Pick a design — your saved resume data will be applied to whichever template you choose when you preview.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { id: 'classic', label: 'Classic', desc: 'Clean single-column layout — ATS-safe and timeless', color: 'border-indigo-300 dark:border-indigo-700', tag: 'Recommended' },
            { id: 'modern', label: 'Modern', desc: 'Two-column with sidebar highlights — eye-catching for laterals', color: 'border-purple-300 dark:border-purple-700', tag: 'Premium' },
            { id: 'minimal', label: 'Minimal', desc: 'Ultra-clean, lots of white space — works great for consultants', color: 'border-gray-300 dark:border-gray-700', tag: null },
            { id: 'executive', label: 'Executive', desc: 'Bold header with ruled sections — authority at first glance', color: 'border-amber-300 dark:border-amber-700', tag: 'Premium' },
            { id: 'creative', label: 'Creative', desc: 'Accent-bar design with icons — for marketing and brand roles', color: 'border-rose-300 dark:border-rose-700', tag: 'Premium' },
            { id: 'academic', label: 'Academic', desc: 'Expanded education section — for research and scholarly roles', color: 'border-emerald-300 dark:border-emerald-700', tag: null },
          ].map((t) => (
            <div key={t.id} className={`relative rounded-2xl border-2 ${t.color} bg-white p-5 dark:bg-gray-900 hover:shadow-md transition-shadow cursor-pointer`}>
              {t.tag && (
                <span className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ${t.tag === 'Recommended' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                  {t.tag}
                </span>
              )}
              {/* Preview thumbnail placeholder */}
              <div className="mb-3 h-24 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                <div className="space-y-1 w-3/4">
                  <div className="h-2 rounded bg-gray-300 dark:bg-gray-600 w-full" />
                  <div className="h-1.5 rounded bg-gray-200 dark:bg-gray-700 w-5/6" />
                  <div className="h-1.5 rounded bg-gray-200 dark:bg-gray-700 w-4/6" />
                  <div className="mt-2 h-1 rounded bg-gray-200 dark:bg-gray-700 w-full" />
                  <div className="h-1 rounded bg-gray-200 dark:bg-gray-700 w-5/6" />
                </div>
              </div>
              <p className="font-semibold text-sm">{t.label}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{t.desc}</p>
              <Link to="/career/resume/preview" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Preview with this template <Eye className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-gray-400 text-center">Premium templates coming soon — Classic is available now.</p>
      </div>
    </div>
  );
}
