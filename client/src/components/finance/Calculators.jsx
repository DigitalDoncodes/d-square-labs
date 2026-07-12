import { useState } from 'react';

const formatINR = (n) =>
  '₹' + Math.round(n).toLocaleString('en-IN');

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900';

function Field({ label, value, onChange, suffix }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
        {label} {suffix && <span className="text-gray-400">({suffix})</span>}
      </label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
    </div>
  );
}

function ResultRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className={highlight ? 'text-lg font-bold text-indigo-600 dark:text-indigo-400' : 'font-medium'}>
        {value}
      </span>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <h3 className="font-semibold">{title}</h3>
      <p className="mb-4 text-xs text-gray-400">{subtitle}</p>
      {children}
    </div>
  );
}

function EMICalculator() {
  const [principal, setPrincipal] = useState('1000000');
  const [rate, setRate] = useState('9');
  const [years, setYears] = useState('5');

  const P = Number(principal) || 0;
  const r = (Number(rate) || 0) / 12 / 100;
  const n = (Number(years) || 0) * 12;
  const emi = r > 0 && n > 0 ? (P * r * (1 + r) ** n) / ((1 + r) ** n - 1) : n > 0 ? P / n : 0;
  const totalPayment = emi * n;

  return (
    <Card title="Loan EMI" subtitle="Monthly repayment for a loan (e.g. education loan)">
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Field label="Loan amount" value={principal} onChange={setPrincipal} suffix="₹" />
        <Field label="Interest" value={rate} onChange={setRate} suffix="% p.a." />
        <Field label="Tenure" value={years} onChange={setYears} suffix="years" />
      </div>
      <div className="space-y-1 border-t border-gray-100 pt-3 dark:border-gray-800">
        <ResultRow label="Monthly EMI" value={formatINR(emi)} highlight />
        <ResultRow label="Total payment" value={formatINR(totalPayment)} />
        <ResultRow label="Total interest" value={formatINR(totalPayment - P)} />
      </div>
    </Card>
  );
}

function SIPCalculator() {
  const [monthly, setMonthly] = useState('5000');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('10');

  const M = Number(monthly) || 0;
  const i = (Number(rate) || 0) / 12 / 100;
  const n = (Number(years) || 0) * 12;
  const invested = M * n;
  const futureValue = i > 0 ? M * (((1 + i) ** n - 1) / i) * (1 + i) : invested;

  return (
    <Card title="SIP Returns" subtitle="Future value of a monthly investment">
      <div className="mb-4 grid grid-cols-3 gap-3">
        <Field label="Monthly SIP" value={monthly} onChange={setMonthly} suffix="₹" />
        <Field label="Expected return" value={rate} onChange={setRate} suffix="% p.a." />
        <Field label="Duration" value={years} onChange={setYears} suffix="years" />
      </div>
      <div className="space-y-1 border-t border-gray-100 pt-3 dark:border-gray-800">
        <ResultRow label="Future value" value={formatINR(futureValue)} highlight />
        <ResultRow label="Amount invested" value={formatINR(invested)} />
        <ResultRow label="Wealth gained" value={formatINR(futureValue - invested)} />
      </div>
    </Card>
  );
}

function SavingsForecast() {
  const [current, setCurrent] = useState('50000');
  const [monthly, setMonthly] = useState('3000');
  const [rate, setRate] = useState('7');
  const [years, setYears] = useState('3');

  const C = Number(current) || 0;
  const M = Number(monthly) || 0;
  const i = (Number(rate) || 0) / 12 / 100;
  const n = (Number(years) || 0) * 12;
  const lumpGrowth = C * (1 + i) ** n;
  const sipGrowth = i > 0 ? M * (((1 + i) ** n - 1) / i) * (1 + i) : M * n;
  const total = lumpGrowth + sipGrowth;
  const contributed = C + M * n;

  return (
    <Card title="Savings Forecast" subtitle="Where your savings will be in a few years">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Current savings" value={current} onChange={setCurrent} suffix="₹" />
        <Field label="Monthly saving" value={monthly} onChange={setMonthly} suffix="₹" />
        <Field label="Interest" value={rate} onChange={setRate} suffix="% p.a." />
        <Field label="Horizon" value={years} onChange={setYears} suffix="years" />
      </div>
      <div className="space-y-1 border-t border-gray-100 pt-3 dark:border-gray-800">
        <ResultRow label="Projected savings" value={formatINR(total)} highlight />
        <ResultRow label="You contribute" value={formatINR(contributed)} />
        <ResultRow label="Interest earned" value={formatINR(total - contributed)} />
      </div>
    </Card>
  );
}

export default function Calculators() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <EMICalculator />
      <SIPCalculator />
      <div className="lg:col-span-2">
        <SavingsForecast />
      </div>
    </div>
  );
}
