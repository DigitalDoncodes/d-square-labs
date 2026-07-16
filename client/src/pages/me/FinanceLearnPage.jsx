import { GraduationCap, Umbrella, PiggyBank, Sprout, TrendingUp, LineChart, Landmark } from 'lucide-react';
import { Page } from '../../components/common/motion';

const LESSONS = [
  { icon: Umbrella, title: 'The emergency fund comes first', body: 'Before any investing: 3–6 months of living costs in a savings account or liquid fund. It is not for returns — it is so a broken laptop or a gap between offers never becomes a crisis. Build it slowly; even ₹500/month counts.' },
  { icon: PiggyBank, title: 'The 50/30/20 rule', body: 'Of whatever money comes in: about 50% for needs (rent, food, fees), 30% for wants (trips, eating out — guilt-free), 20% saved or invested. On a student budget the exact split matters less than having one at all.' },
  { icon: Sprout, title: 'The power of compounding', body: 'Money grows on its own growth. ₹5,000/month at 12% becomes ~₹11.6 lakh in 10 years — but ~₹1.76 crore in 30. The last decade earns more than the first two combined. Starting at 25 instead of 35 roughly triples the outcome. Time matters more than amount.' },
  { icon: TrendingUp, title: 'SIPs: investing on autopilot', body: 'A SIP (Systematic Investment Plan) invests a fixed amount into a mutual fund every month, automatically. You buy more units when markets are down, fewer when up — no timing, no willpower needed. It is the single best habit to start with your first salary.' },
  { icon: LineChart, title: 'Mutual funds vs. picking stocks', body: 'A mutual fund pools money from many people and spreads it across dozens of companies — one bad company cannot sink you. Low-cost index funds (following Nifty 50) beat most professionals over long periods. Picking individual stocks is a hobby; funds are a plan.' },
  { icon: Landmark, title: 'Long-term wealth is boring', body: 'The reliable formula: earn, keep fixed costs low, automate a monthly SIP, ignore market noise, let decades do the work. Nobody gets rich from tips and trading apps; plenty do from thirty years of unglamorous consistency.' },
];

export default function FinanceLearnPage() {
  return (
    <Page>
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
    </Page>
  );
}
