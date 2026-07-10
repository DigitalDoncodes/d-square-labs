import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Target,
  IndianRupee,
  ListChecks,
  MessageCircleQuestion,
  Lightbulb,
  ExternalLink,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { getCompany } from '../api/companies';
import { sectorMeta, QUESTION_LABELS } from '../utils/companies';
import Loader from '../components/common/Loader';

function Section({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
      <h2 className="mb-3 flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-indigo-500" /> {title}
      </h2>
      {children}
    </section>
  );
}

const QUESTION_TINTS = {
  hr: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  technical: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  case: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  guesstimate: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

export default function CompanyDetailPage() {
  const { slug } = useParams();
  const [company, setCompany] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getCompany(slug)
      .then((res) => setCompany(res.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-gray-400">
        Company not found.{' '}
        <Link to="/companies" className="text-indigo-500 hover:underline">
          Back to companies
        </Link>
      </div>
    );
  }
  if (!company) return <Loader />;

  const meta = sectorMeta(company.sector);
  const MetaIcon = meta.icon;

  return (
    <div className="animate-in mx-auto max-w-4xl px-4 py-6">
      <Link
        to="/companies"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
      >
        <ArrowLeft className="h-4 w-4" /> All companies
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-indigo-200/70 bg-gradient-to-r from-indigo-50 to-blue-50 p-6 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:to-blue-950/30 sm:flex-row sm:items-center">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-gray-900 dark:text-indigo-400">
          <MetaIcon className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="rounded-full bg-white/70 px-2 py-0.5 font-medium uppercase tracking-wide dark:bg-gray-900/60">
              {meta.label}
            </span>
            {company.headquarters && (
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {company.headquarters}</span>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        {company.salaryRange && (
          <div className="shrink-0 rounded-xl bg-white/80 px-4 py-2 text-center dark:bg-gray-900/60">
            <p className="flex items-center justify-center gap-1 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <IndianRupee className="h-4 w-4" /> {company.salaryRange.replace(/^₹\s*/, '')}
            </p>
            <p className="text-[10px] text-gray-400">indicative — verify at the drive</p>
          </div>
        )}
      </div>

      <div className="space-y-5">
        <Section icon={Building2} title="What they do">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{company.overview}</p>
          {company.businessModel && (
            <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
              <h3 className="mb-1.5 text-sm font-semibold">How they make money</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{company.businessModel}</p>
            </div>
          )}
        </Section>

        <div className="grid gap-5 md:grid-cols-2">
          {company.whatTheyLookFor && (
            <Section icon={Target} title="What they look for">
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{company.whatTheyLookFor}</p>
            </Section>
          )}

          {(company.roles?.length > 0 || company.rounds?.length > 0) && (
            <Section icon={ListChecks} title="Roles & hiring process">
              {company.roles?.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {company.roles.map((r) => (
                    <span
                      key={r}
                      className="flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                    >
                      <Briefcase className="h-3 w-3" /> {r}
                    </span>
                  ))}
                </div>
              )}
              {company.rounds?.length > 0 && (
                <ol className="space-y-2">
                  {company.rounds.map((round, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-300">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                        {i + 1}
                      </span>
                      {round}
                    </li>
                  ))}
                </ol>
              )}
            </Section>
          )}
        </div>

        {company.interviewQuestions?.length > 0 && (
          <Section icon={MessageCircleQuestion} title="Questions they actually ask">
            <ul className="space-y-2.5">
              {company.interviewQuestions.map((q, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span
                    className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      QUESTION_TINTS[q.category] || QUESTION_TINTS.hr
                    }`}
                  >
                    {QUESTION_LABELS[q.category] || q.category}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{q.question}</p>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {company.prepTips?.length > 0 && (
          <Section icon={Lightbulb} title="Prep tips">
            <ul className="space-y-2">
              {company.prepTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                  {tip}
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>
    </div>
  );
}
