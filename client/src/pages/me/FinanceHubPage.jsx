import { useState } from 'react';
import {
  GraduationCap, Calculator, TrendingUp, PiggyBank, Umbrella, LineChart, Landmark, Sprout, Banknote,
} from 'lucide-react';
import useViewSwitch from '../../hooks/useViewSwitch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { Page } from '../../components/common/motion';
import FinancePage from '../FinancePage';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900';

const inr = (n) =>
  '₹' + Math.round(n).toLocaleString('en-IN');

// ── Lessons ──────────────────────────────────────────────────────────────────
// Short, honest, jargon-free. The goal is confidence, not accounting.
const LESSONS = [
  {
    icon: Umbrella,
    title: 'The emergency fund comes first',
    body: 'Before any investing: 3–6 months of living costs in a savings account or liquid fund. It is not for returns — it is so a broken laptop or a gap between offers never becomes a crisis. Build it slowly; even ₹500/month counts.',
  },
  {
    icon: PiggyBank,
    title: 'The 50/30/20 rule',
    body: 'Of whatever money comes in: about 50% for needs (rent, food, fees), 30% for wants (trips, eating out — guilt-free), 20% saved or invested. On a student budget the exact split matters less than having one at all.',
  },
  {
    icon: Sprout,
    title: 'The power of compounding',
    body: 'Money grows on its own growth. ₹5,000/month at 12% becomes ~₹11.6 lakh in 10 years — but ~₹1.76 crore in 30. The last decade earns more than the first two combined. Starting at 25 instead of 35 roughly triples the outcome. Time matters more than amount.',
  },
  {
    icon: TrendingUp,
    title: 'SIPs: investing on autopilot',
    body: 'A SIP (Systematic Investment Plan) invests a fixed amount into a mutual fund every month, automatically. You buy more units when markets are down, fewer when up — no timing, no willpower needed. It is the single best habit to start with your first salary.',
  },
  {
    icon: LineChart,
    title: 'Mutual funds vs. picking stocks',
    body: 'A mutual fund pools money from many people and spreads it across dozens of companies — one bad company cannot sink you. Low-cost index funds (following Nifty 50) beat most professionals over long periods. Picking individual stocks is a hobby; funds are a plan.',
  },
  {
    icon: Landmark,
    title: 'Long-term wealth is boring',
    body: 'The reliable formula: earn, keep fixed costs low, automate a monthly SIP, ignore market noise, let decades do the work. Nobody gets rich from tips and trading apps; plenty do from thirty years of unglamorous consistency.',
  },
];

// ── Calculators ──────────────────────────────────────────────────────────────
function CalcCard({ title, icon: Icon, children, result }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-indigo-500" /> {title}
      </h3>
      <div className="space-y-2.5">{children}</div>
      {result}
    </div>
  );
}

function Field({ label, value, onChange, suffix }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="relative">
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={inputClass}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>}
      </div>
    </label>
  );
}

function Result({ lines }) {
  return (
    <div className="mt-4 rounded-xl bg-indigo-50/70 p-3 dark:bg-indigo-950/30">
      {lines.map(([label, value], i) => (
        <div key={label} className="flex items-baseline justify-between py-0.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
          <span className={i === lines.length - 1 ? 'text-base font-bold text-indigo-600 dark:text-indigo-300' : 'text-sm font-medium'}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}

function SipCalculator() {
  const [monthly, setMonthly] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);
  const n = (Number(years) || 0) * 12;
  const r = (Number(rate) || 0) / 100 / 12;
  const invested = (Number(monthly) || 0) * n;
  const value = r > 0 ? (Number(monthly) || 0) * ((((1 + r) ** n - 1) / r) * (1 + r)) : invested;
  return (
    <CalcCard
      title="SIP growth"
      icon={TrendingUp}
      result={
        <Result lines={[
          ['You invest', inr(invested)],
          ['Growth', inr(value - invested)],
          [`Value after ${years || 0} years`, inr(value)],
        ]} />
      }
    >
      <Field label="Monthly investment" value={monthly} onChange={setMonthly} suffix="₹/month" />
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="For how long" value={years} onChange={setYears} suffix="years" />
        <Field label="Expected return" value={rate} onChange={setRate} suffix="%/yr" />
      </div>
    </CalcCard>
  );
}

function CompoundCalculator() {
  const [amount, setAmount] = useState(100000);
  const [years, setYears] = useState(20);
  const [rate, setRate] = useState(12);
  const value = (Number(amount) || 0) * (1 + (Number(rate) || 0) / 100) ** (Number(years) || 0);
  return (
    <CalcCard
      title="One-time investment compounding"
      icon={Sprout}
      result={
        <Result lines={[
          ['You invest once', inr(Number(amount) || 0)],
          ['Growth', inr(value - (Number(amount) || 0))],
          [`Value after ${years || 0} years`, inr(value)],
        ]} />
      }
    >
      <Field label="Amount invested today" value={amount} onChange={setAmount} suffix="₹" />
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Left to grow for" value={years} onChange={setYears} suffix="years" />
        <Field label="Expected return" value={rate} onChange={setRate} suffix="%/yr" />
      </div>
    </CalcCard>
  );
}

function EmergencyFundCalculator() {
  const [expenses, setExpenses] = useState(15000);
  const [months, setMonths] = useState(6);
  const [saving, setSaving] = useState(2000);
  const target = (Number(expenses) || 0) * (Number(months) || 0);
  const timeTo = Number(saving) > 0 ? Math.ceil(target / Number(saving)) : null;
  return (
    <CalcCard
      title="Emergency fund target"
      icon={Umbrella}
      result={
        <Result lines={[
          ['Your safety net target', inr(target)],
          ['Reached in', timeTo ? `${timeTo} month${timeTo === 1 ? '' : 's'}` : '—'],
        ]} />
      }
    >
      <Field label="Monthly living costs" value={expenses} onChange={setExpenses} suffix="₹/month" />
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Months of cover" value={months} onChange={setMonths} suffix="months" />
        <Field label="You can save" value={saving} onChange={setSaving} suffix="₹/month" />
      </div>
    </CalcCard>
  );
}

function BudgetCalculator() {
  const [income, setIncome] = useState(20000);
  const i = Number(income) || 0;
  return (
    <CalcCard
      title="50/30/20 budget split"
      icon={PiggyBank}
      result={
        <Result lines={[
          ['Needs (50%)', inr(i * 0.5)],
          ['Wants (30%)', inr(i * 0.3)],
          ['Save & invest (20%)', inr(i * 0.2)],
        ]} />
      }
    >
      <Field label="Monthly money in (allowance, stipend, salary)" value={income} onChange={setIncome} suffix="₹/month" />
    </CalcCard>
  );
}

function EmiCalculator() {
  const [amount, setAmount] = useState(1000000);
  const [years, setYears] = useState(7);
  const [rate, setRate] = useState(10);
  const p = Number(amount) || 0;
  const n = (Number(years) || 0) * 12;
  const r = (Number(rate) || 0) / 100 / 12;
  const emi = r > 0 && n > 0 ? (p * r * (1 + r) ** n) / ((1 + r) ** n - 1) : n > 0 ? p / n : 0;
  return (
    <CalcCard
      title="Loan EMI (e.g. education loan)"
      icon={Banknote}
      result={
        <Result lines={[
          ['Total repaid', inr(emi * n)],
          ['Of which interest', inr(emi * n - p)],
          ['Monthly EMI', inr(emi)],
        ]} />
      }
    >
      <Field label="Loan amount" value={amount} onChange={setAmount} suffix="₹" />
      <div className="grid grid-cols-2 gap-2.5">
        <Field label="Tenure" value={years} onChange={setYears} suffix="years" />
        <Field label="Interest rate" value={rate} onChange={setRate} suffix="%/yr" />
      </div>
    </CalcCard>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function FinanceHubPage() {
  useDocumentTitle('Finance');
  const { active, switcher } = useViewSwitch(
    [
      { key: 'learn', label: 'Learn' },
      { key: 'calculators', label: 'Calculators' },
      { key: 'tracker', label: 'Tracker' },
    ],
    'learn'
  );

  // The tracker is the old Finance page, unchanged — just no longer the headline.
  if (active === 'tracker') {
    return (
      <>
        {switcher}
        <FinancePage />
      </>
    );
  }

  return (
    <>
      {switcher}
      <Page className="mx-auto max-w-3xl px-4 py-6">
        {active === 'learn' ? (
          <>
            <div className="mb-6">
              <h1 className="flex items-center gap-2 text-xl font-bold">
                <GraduationCap className="h-5 w-5 text-indigo-500" /> Money, explained simply
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Six ideas that matter more than any stock tip. Read them once now, thank yourself at 40.
              </p>
            </div>
            <div className="space-y-3">
              {LESSONS.map((l) => (
                <section key={l.title} className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
                  <h2 className="mb-1.5 flex items-center gap-2 text-sm font-semibold">
                    <l.icon className="h-4 w-4 text-indigo-500" /> {l.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{l.body}</p>
                </section>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-gray-400">
              Education, not advice — for decisions involving real money, a SEBI-registered advisor beats any app.
            </p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <h1 className="flex items-center gap-2 text-xl font-bold">
                <Calculator className="h-5 w-5 text-indigo-500" /> See it with your own numbers
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The lessons, made concrete. Change a number and watch what time does to it.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SipCalculator />
              <CompoundCalculator />
              <EmergencyFundCalculator />
              <BudgetCalculator />
              <EmiCalculator />
            </div>
          </>
        )}
      </Page>
    </>
  );
}
