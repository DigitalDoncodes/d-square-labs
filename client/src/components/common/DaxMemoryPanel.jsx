// Dax Memory — the student's view of what Dax carries between sessions.
//
// Memory a student cannot see or correct is surveillance, not a companion. So
// this panel is deliberately plain: here is what Dax knows, here is how to fix
// it, here is how to make it forget. Everything Dax remembers is either
// something you told it or something it can point at in your own data.
import { useEffect, useState } from 'react';
import { Brain, Check, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDaxMemory, updateDaxMemory, forgetDaxMemory } from '../../api/ai';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import { Skeleton } from './Skeleton';
import { DAX_CAPABILITY } from '../../utils/dax';

// Only the fields the API accepts on PATCH — keep in sync with aiRoutes.
const EXPLANATION_STYLES = [
  { value: 'concise',         label: 'Concise' },
  { value: 'detailed',        label: 'Detailed' },
  { value: 'framework-heavy', label: 'Framework-heavy' },
  { value: 'example-heavy',   label: 'Example-heavy' },
];

const asList = (v) => (Array.isArray(v) ? v.join(', ') : '');
const toList = (s) => s.split(',').map((x) => x.trim()).filter(Boolean);

function Row({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      {children}
    </label>
  );
}

export default function DaxMemoryPanel() {
  const [mem, setMem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmForget, setConfirmForget] = useState(false);
  const [form, setForm] = useState({
    specialization: '',
    careerInterests: '',
    targetCompanies: '',
    targetRoles: '',
    preferredExplanationStyle: 'concise',
  });

  const hydrate = (m) => {
    setMem(m);
    setForm({
      specialization: m?.specialization || '',
      careerInterests: asList(m?.careerInterests),
      targetCompanies: asList(m?.targetCompanies),
      targetRoles: asList(m?.targetRoles),
      preferredExplanationStyle: m?.preferredExplanationStyle || 'concise',
    });
  };

  useEffect(() => {
    getDaxMemory()
      .then((r) => hydrate(r.data))
      .catch(() => toast.error('Could not load what Dax remembers'))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateDaxMemory({
        specialization: form.specialization || undefined,
        careerInterests: toList(form.careerInterests),
        targetCompanies: toList(form.targetCompanies),
        targetRoles: toList(form.targetRoles),
        preferredExplanationStyle: form.preferredExplanationStyle,
      });
      const r = await getDaxMemory();
      hydrate(r.data);
      toast.success('Dax updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update Dax');
    } finally {
      setSaving(false);
    }
  };

  const forget = async () => {
    try {
      await forgetDaxMemory();
      const r = await getDaxMemory(); // re-bootstraps a clean baseline
      hydrate(r.data);
      toast.success('Dax has forgotten what it learned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not clear memory');
    }
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="mb-1 flex items-center gap-2 font-semibold">
        <Brain className="h-4 w-4 text-indigo-500" /> {DAX_CAPABILITY.memory}
      </h2>
      <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
        What Dax carries between sessions, so you never have to explain yourself twice.
        Correct anything that&rsquo;s wrong — Dax uses this everywhere, not just in chat.
      </p>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <Row label="Specialization">
              <input
                className="input"
                value={form.specialization}
                placeholder="e.g. Consulting"
                onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
              />
            </Row>
            <Row label="Career interests">
              <input
                className="input"
                value={form.careerInterests}
                placeholder="Comma separated — e.g. strategy, product"
                onChange={(e) => setForm((f) => ({ ...f, careerInterests: e.target.value }))}
              />
            </Row>
            <div className="grid gap-3 sm:grid-cols-2">
              <Row label="Target companies">
                <input
                  className="input"
                  value={form.targetCompanies}
                  placeholder="e.g. Bain, McKinsey"
                  onChange={(e) => setForm((f) => ({ ...f, targetCompanies: e.target.value }))}
                />
              </Row>
              <Row label="Target roles">
                <input
                  className="input"
                  value={form.targetRoles}
                  placeholder="e.g. Associate Consultant"
                  onChange={(e) => setForm((f) => ({ ...f, targetRoles: e.target.value }))}
                />
              </Row>
            </div>
            <Row label="How Dax should explain things">
              <select
                className="input"
                value={form.preferredExplanationStyle}
                onChange={(e) => setForm((f) => ({ ...f, preferredExplanationStyle: e.target.value }))}
              >
                {EXPLANATION_STYLES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </Row>
          </div>

          {/* Observed, not editable — these come from what you actually did. */}
          {mem?.recentTopics?.length > 0 && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Recently discussed
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mem.recentTopics.slice(-5).reverse().map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="max-w-full truncate rounded-full bg-gray-100 px-2.5 py-1 text-[11px] text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    title={t}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button icon={Check} loading={saving} onClick={save}>Save</Button>
            <Button variant="ghost" icon={Trash2} onClick={() => setConfirmForget(true)}>
              Make Dax forget
            </Button>
          </div>
        </>
      )}

      <ConfirmModal
        open={confirmForget}
        onClose={() => setConfirmForget(false)}
        onConfirm={forget}
        title="Make Dax forget?"
        message="Dax will drop what it has learned and inferred about you. It will start over from your profile, resume and activity — your notes, tasks and resume are not touched."
        danger
        confirmLabel="Forget"
      />
    </section>
  );
}
