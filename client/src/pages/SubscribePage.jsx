import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Sparkles, Zap, Crown, CheckCircle2, X, ArrowLeft, Copy, Loader2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import { submitPaymentRef, activateTrial, getSubscriptionStatus } from '../api/subscription';
import { TIER_COLORS } from '../utils/tiers';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const oneMonthFrom = (d) => {
  const e = new Date(d);
  e.setMonth(e.getMonth() + 1);
  return e;
};

// ── Config ─────────────────────────────────────────────────────────────────
const UPI_VPA  = import.meta.env.VITE_UPI_VPA  || 'datad@upi';
const UPI_NAME = import.meta.env.VITE_UPI_NAME || 'DATAD';

const PLANS = [
  {
    id: 'trial',
    label: 'Trial',
    icon: Sparkles,
    price: null,
    priceLabel: 'Free · 7 days',
    color: 'indigo',
    tagline: 'Taste everything before you commit',
    features: [
      'Full Pro experience for 7 days',
      '10 AI actions per day — real AI, honest cap',
      'AI resume review & note summaries',
      'AI planner suggestions + daily briefing',
      'Company prep cards + insights',
      'Semantic search across notes',
      'One-time only — no payment needed',
    ],
    cta: 'Start Free Trial',
  },
  {
    id: 'pro',
    label: 'Pro',
    icon: Zap,
    price: 299,
    priceLabel: '₹299 / month',
    color: 'amber',
    tagline: 'The placement edge every B-schooler needs',
    features: [
      '75 AI actions per day (fair use)',
      'Unlimited notes + AI summarization',
      'AI resume review & feedback',
      'Company prep cards (process, questions, CTC)',
      'Daily personalized AI briefing',
      'AI planner suggestions',
      'Interview question bank (full access)',
      'Daily MBA case studies with frameworks',
      'Semantic search across your notes',
      'Career readiness score breakdown',
    ],
    cta: 'Pay ₹299',
  },
  {
    id: 'max',
    label: 'Max',
    icon: Crown,
    price: 499,
    priceLabel: '₹499 / month',
    color: 'purple',
    popular: true,
    tagline: 'For the student who leaves nothing to chance',
    features: [
      'Everything in Pro',
      '250 AI actions per day + priority queue',
      'AI career advisor — deep strategy conversations',
      'Interview simulator — mock rounds tailored to your resume',
      'AI company comparator — decisive prep verdicts',
      'Priority AI (faster during peak hours)',
      'Semantic search across notes + company data',
      'Early access to new features',
      'Priority support',
    ],
    cta: 'Pay ₹499',
  },
];

const COLOR = TIER_COLORS;

// ── QR + payment ref panel ─────────────────────────────────────────────────
function PaymentPanel({ plan, onClose, onSuccess }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const upiUrl = `upi://pay?pa=${UPI_VPA}&pn=${encodeURIComponent(UPI_NAME)}&am=${plan.price}&tn=${encodeURIComponent(`DATAD ${plan.label} Plan`)}&cu=INR`;

  const onSubmit = async ({ paymentRef, upiId, note }) => {
    try {
      await submitPaymentRef({ tier: plan.id, paymentRef, upiId, note });
      toast.success('Payment reference submitted! We will activate your plan within 24 hours.');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    }
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(UPI_VPA);
    toast.success('UPI ID copied');
  };

  const c = COLOR[plan.color];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">
        {/* Header */}
        <div className={`flex items-center justify-between rounded-t-2xl border-b px-5 py-4 ${c.bg} ${c.border}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Payment</p>
            <p className="text-lg font-bold">{plan.label} Plan — {plan.priceLabel}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* QR */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-500 dark:text-gray-400">Scan with any UPI app</p>
            <div className="rounded-xl border-2 border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-white">
              <QRCodeSVG value={upiUrl} size={180} />
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm dark:bg-gray-800">
              <span className="font-mono text-gray-700 dark:text-gray-300">{UPI_VPA}</span>
              <button onClick={copyUPI} className="text-gray-400 hover:text-gray-600">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-xs text-gray-400">PhonePe · GPay · Paytm · BHIM · any UPI</p>
          </div>

          {/* Ref form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                UPI / Payment Reference Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('paymentRef', {
                  required: 'Reference number is required',
                  minLength: { value: 6, message: 'Enter the full reference number' },
                })}
                placeholder="e.g. 421234567890"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700"
              />
              {errors.paymentRef && (
                <p className="mt-1 text-xs text-red-500">{errors.paymentRef.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Your UPI ID <span className="text-gray-400 font-normal">(optional, helps us verify faster)</span>
              </label>
              <input
                {...register('upiId')}
                placeholder="yourname@upi"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-600 dark:text-gray-400">
                Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                {...register('note')}
                placeholder="Anything we should know"
                className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition ${c.btn} disabled:opacity-60`}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Submit Payment Reference
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            Your plan will be activated within 24 hours after verification.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function SubscribePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [confirmPlan, setConfirmPlan] = useState(null);
  const [trialLoading, setTrialLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState(null); // { tier, tierExpiresAt, trialUsed } from DB

  // Fetch real DB state — JWT tier can be stale after trial activation/expiry
  useEffect(() => {
    getSubscriptionStatus()
      .then((res) => setStatus(res.data))
      .catch(() => {});
  }, []);

  const currentTier = status?.tier ?? user?.tier ?? 'free';
  const trialUsed = !!status?.trialUsed;
  const tierExpiresAt = status?.tierExpiresAt ? new Date(status.tierExpiresAt) : null;
  const daysLeft = tierExpiresAt
    ? Math.max(0, Math.ceil((tierExpiresAt - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  const handleSelect = async (plan) => {
    if (plan.id === 'trial') {
      setTrialLoading(true);
      try {
        const res = await activateTrial();
        toast.success('🎉 7-day trial activated! Redirecting you to the dashboard…');
        setStatus((s) => ({ ...s, tier: 'trial', trialUsed: true, tierExpiresAt: res.data?.expiresAt }));
        setTimeout(() => navigate('/'), 2000);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not activate trial');
      } finally {
        setTrialLoading(false);
      }
      return;
    }
    setConfirmPlan(plan);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-green-500" />
        <h1 className="text-2xl font-bold">Payment Reference Submitted</h1>
        <p className="max-w-sm text-gray-500">
          We'll verify your payment and activate your plan within 24 hours. You'll be notified once it's done.
        </p>
        <Link to="/" className="mt-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          {currentTier !== 'free' && (
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              Current plan: {currentTier.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Upgrade your placement prep
          </h1>
          <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
            Unlock AI tools, unlimited notes, and career prep built for Indian B-school placements.
          </p>
        </div>

        {/* Current plan banner */}
        {currentTier === 'trial' && (
          <div className="mb-10 rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-5 text-center dark:border-indigo-800 dark:bg-indigo-950/30">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white">
              <Sparkles className="h-3.5 w-3.5" /> Free trial active
            </span>
            <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
              Your free trial has already started
              {tierExpiresAt && (
                <> — it expires on <span className="font-bold">{fmtDate(tierExpiresAt)}</span>
                  {daysLeft !== null && (
                    <span className="ml-1.5 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                      {daysLeft} day{daysLeft === 1 ? '' : 's'} left
                    </span>
                  )}
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upgrade to Pro or Max to unlock the full potential of DATAD.
            </p>
          </div>
        )}
        {(currentTier === 'pro' || currentTier === 'max') && (
          <div className={`mb-10 rounded-2xl border px-6 py-5 text-center ${currentTier === 'max' ? 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/20' : 'border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/20'}`}>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white ${currentTier === 'max' ? 'bg-purple-600' : 'bg-amber-500'}`}>
              {currentTier === 'max' ? <Crown className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
              {currentTier.toUpperCase()} plan active
            </span>
            <p className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">
              {tierExpiresAt
                ? <>Your plan is valid till <span className="font-bold">{fmtDate(tierExpiresAt)}</span>{daysLeft !== null && ` (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)`}.</>
                : 'Your plan is active.'}
            </p>
            {currentTier === 'pro' && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Want more? Upgrade to Max for the AI career advisor and priority AI.
              </p>
            )}
          </div>
        )}

        {/* Feature comparison */}
        <div className="mb-10 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          <div className="grid grid-cols-5 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:border-gray-800 dark:bg-gray-900/50">
            <span className="col-span-2">Feature</span>
            <span className="text-center">Free</span>
            <span className="text-center text-amber-600 dark:text-amber-400">Pro</span>
            <span className="text-center text-purple-600 dark:text-purple-400">Max</span>
          </div>
          {[
            //                                     free   pro    max
            ['Dashboard + announcements',          true,  true,  true ],
            ['Journal (private)',                  true,  true,  true ],
            ['Finance tracker',                    true,  true,  true ],
            ['Notes — create & read',              true,  true,  true ],
            ['Resume builder (manual)',            true,  true,  true ],
            ['Company list (browse)',              true,  true,  true ],
            ['Community & gallery',                true,  true,  true ],
            ['Notes — AI summarization',           false, true,  true ],
            ['AI resume review & feedback',        false, true,  true ],
            ['Company prep cards (full detail)',   false, true,  true ],
            ['Daily AI briefing (personalized)',   false, true,  true ],
            ['Interview question bank',            false, true,  true ],
            ['Daily MBA case study + framework',   false, true,  true ],
            ['AI planner suggestions',             false, true,  true ],
            ['Semantic search across notes',       false, true,  true ],
            ['Career readiness score',             false, true,  true ],
            ['AI career advisor (deep strategy)',  false, false, true ],
            ['Interview simulator (mock rounds)',  false, false, true ],
            ['AI company comparison verdicts',     false, false, true ],
            ['Priority AI processing',             false, false, true ],
          ].map(([label, free, pro, max]) => (
            <div key={label} className="grid grid-cols-5 border-b border-gray-100 px-5 py-2.5 text-sm last:border-0 dark:border-gray-800">
              <span className="col-span-2 text-gray-700 dark:text-gray-300">{label}</span>
              <span className="flex justify-center">{free ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-gray-200 dark:text-gray-700" />}</span>
              <span className="flex justify-center">{pro  ? <CheckCircle2 className="h-4 w-4 text-amber-500" /> : <X className="h-4 w-4 text-gray-200 dark:text-gray-700" />}</span>
              <span className="flex justify-center">{max  ? <CheckCircle2 className="h-4 w-4 text-purple-500" /> : <X className="h-4 w-4 text-gray-200 dark:text-gray-700" />}</span>
            </div>
          ))}
        </div>

        {/* Plan cards */}
        <div className="grid gap-5 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const c = COLOR[plan.color];
            const isCurrent = currentTier === plan.id;
            const isTrialActive = plan.id === 'trial' && currentTier === 'trial';
            const isTrialUsed = plan.id === 'trial' && !isTrialActive && (trialUsed || currentTier !== 'free');

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border-2 bg-white p-6 dark:bg-gray-900 ${plan.popular ? c.border : 'border-gray-200 dark:border-gray-800'}`}
              >
                {plan.popular && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-xs font-bold ${c.badge}`}>
                    Most Popular
                  </span>
                )}
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
                  <Icon className={`h-5 w-5 ${c.icon}`} />
                </div>
                <h3 className="text-lg font-bold">{plan.label}</h3>
                <p className={`text-2xl font-bold ${c.icon}`}>{plan.priceLabel}</p>
                <p className="mb-5 mt-1 text-xs text-gray-500 dark:text-gray-400">{plan.tagline}</p>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  disabled={isCurrent || isTrialUsed || (plan.id === 'trial' && trialLoading)}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${c.btn}`}
                >
                  {plan.id === 'trial' && trialLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : isTrialActive
                    ? `✓ Trial Active${tierExpiresAt ? ` · ends ${fmtDate(tierExpiresAt)}` : ''}`
                    : isCurrent
                    ? '✓ Current Plan'
                    : isTrialUsed
                    ? 'Trial Used'
                    : plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <p className="mt-8 text-center text-sm text-gray-400">
          Payments are processed via UPI. Plans activate within 24 hours of payment verification.
          <br />For any issues, use the Support page.
        </p>
      </div>

      {/* Subscription confirmation modal */}
      <Modal
        open={!!confirmPlan}
        onClose={() => setConfirmPlan(null)}
        title={`Confirm ${confirmPlan?.label || ''} subscription`}
      >
        {confirmPlan && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm dark:bg-gray-800/50">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Plan</span>
                <span className="font-semibold">{confirmPlan.label} — ₹{confirmPlan.price}/month</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Starts</span>
                <span className="font-semibold">{fmtDate(new Date())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Ends</span>
                <span className="font-semibold">{fmtDate(oneMonthFrom(new Date()))}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You will be subscribed to <span className="font-semibold">{confirmPlan.label}</span> from{' '}
              <span className="font-semibold">{fmtDate(new Date())}</span> till{' '}
              <span className="font-semibold">{fmtDate(oneMonthFrom(new Date()))}</span> — one month, no
              auto-renewal. Your plan activates within 24 hours of payment verification.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmPlan(null)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => { setSelectedPlan(confirmPlan); setConfirmPlan(null); }}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${COLOR[confirmPlan.color].btn}`}
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment modal */}
      {selectedPlan && (
        <PaymentPanel
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => { setSelectedPlan(null); setSubmitted(true); }}
        />
      )}
    </div>
  );
}
