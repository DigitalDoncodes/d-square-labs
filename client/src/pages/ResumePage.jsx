import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Plus, Save, Trash2, Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { getMyResume, saveResume } from '../api/resume';
import { reviewResume } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import { FeedSkeleton } from '../components/common/Skeleton';
import TierGate from '../components/common/TierGate';
import AIBadge from '../components/common/AIBadge';
import CrownBadge from '../components/common/CrownBadge';

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
      toast.error(err.response?.data?.message || 'AI review failed');
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
        <Sparkles className="h-4 w-4" /> Review with AI
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
        <Sparkles className="h-4 w-4" /> Retry AI review
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
          <Sparkles className="h-4 w-4" /> AI Review
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

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900';

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
            form="resume-form"
            type="submit"
            disabled={formState.isSubmitting}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {formState.isSubmitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <form id="resume-form" onSubmit={handleSubmit(onSave)} className="space-y-4">
        <Section title="Personal details">
          <div className="grid gap-3 sm:grid-cols-2">
            <input {...register('personal.fullName')} placeholder="Full name" aria-label="Full name" className={inputClass} />
            <input {...register('personal.email')} placeholder="Email" aria-label="Email" className={inputClass} />
            <input {...register('personal.phone')} placeholder="Phone" aria-label="Phone" className={inputClass} />
            <input {...register('personal.location')} placeholder="City, State" aria-label="Location" className={inputClass} />
            <input {...register('personal.linkedin')} placeholder="LinkedIn URL" aria-label="LinkedIn URL" className={inputClass} />
            <input {...register('personal.website')} placeholder="Portfolio/website (optional)" aria-label="Website" className={inputClass} />
          </div>
        </Section>

        <Section title="Professional summary" hint="2–3 lines. Who you are, your focus area, what you bring.">
          <textarea
            {...register('summary')}
            rows={3}
            placeholder="MBA candidate specialising in Finance with experience in…"
            aria-label="Professional summary"
            className={inputClass}
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
                <input {...register(`education.${i}.degree`)} placeholder="Degree (e.g. MBA — Finance)" aria-label="Degree" className={inputClass} />
                <input {...register(`education.${i}.institution`)} placeholder="Institution" aria-label="Institution" className={inputClass} />
                <input {...register(`education.${i}.years`)} placeholder="Years (e.g. 2025–2027)" aria-label="Years" className={inputClass} />
                <input {...register(`education.${i}.score`)} placeholder="CGPA / % (optional)" aria-label="Score" className={inputClass} />
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
                  <input {...register(`experience.${i}.role`)} placeholder="Role" aria-label="Role" className={inputClass} />
                  <input {...register(`experience.${i}.organization`)} placeholder="Company / Organization" aria-label="Organization" className={inputClass} />
                  <input {...register(`experience.${i}.duration`)} placeholder="Duration (e.g. May–Jul 2026)" aria-label="Duration" className={inputClass} />
                </div>
                <textarea
                  {...register(`experience.${i}.description`)}
                  rows={3}
                  placeholder={'One bullet per line:\nAnalysed sales data for 3 regions…\nPresented findings to senior management…'}
                  aria-label="Description"
                  className={inputClass}
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
                  <input {...register(`projects.${i}.title`)} placeholder="Project title" aria-label="Project title" className={inputClass} />
                  <input {...register(`projects.${i}.link`)} placeholder="Link (optional)" aria-label="Project link" className={inputClass} />
                </div>
                <textarea
                  {...register(`projects.${i}.description`)}
                  rows={2}
                  placeholder="What it was, what you did, the result"
                  aria-label="Project description"
                  className={inputClass}
                />
              </div>
            )}
          </EntryList>
        </Section>

        <Section title="Skills" hint="One skill per line (e.g. Financial Modelling, Excel, Power BI, SQL)">
          <textarea {...register('skillsText')} rows={4} aria-label="Skills" className={inputClass} />
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
                <input {...register(`certifications.${i}.name`)} placeholder="Certification" aria-label="Certification name" className={inputClass} />
                <input {...register(`certifications.${i}.issuer`)} placeholder="Issuer" aria-label="Issuer" className={inputClass} />
                <input {...register(`certifications.${i}.year`)} placeholder="Year" aria-label="Year" className={inputClass} />
              </div>
            )}
          </EntryList>
        </Section>

        <Section title="Achievements" hint="One per line — awards, ranks, competitions">
          <textarea {...register('achievementsText')} rows={3} aria-label="Achievements" className={inputClass} />
        </Section>

        <Section title="Leadership & extracurricular" hint="One per line — clubs, committees, volunteering">
          <textarea {...register('leadershipText')} rows={3} aria-label="Leadership and extracurricular" className={inputClass} />
        </Section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {formState.isSubmitting ? 'Saving…' : 'Save resume'}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">AI Review</span>
          <CrownBadge required="pro" />
        </div>
        <TierGate required="pro" description="Professional ATS analysis and targeted AI improvements — specific to your resume sections, not generic advice.">
          <p className="mb-2 text-xs text-gray-400">Save your resume first, then get AI feedback on it.</p>
          <AIReviewPanel />
        </TierGate>
      </div>
    </div>
  );
}
