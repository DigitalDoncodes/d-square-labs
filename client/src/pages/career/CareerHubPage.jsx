import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Building2, MessageSquare, ArrowRight, ExternalLink, Newspaper, Lock } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useSubscription } from '../../context/SubscriptionContext';
import { listCompanies, getCompanyNews } from '../../api/companies';
import ReadinessCard from '../../components/common/ReadinessCard';
import PlacementCountdown from '../../components/career/PlacementCountdown';
import PlacementJourney from '../../components/career/PlacementJourney';
import UpcomingGrid from '../../components/common/UpcomingGrid';
import { getReadiness } from '../../api/readiness';
import { Page } from '../../components/common/motion';

const SOURCE_DOT = {
  'Economic Times':    'bg-orange-400',
  'Moneycontrol':      'bg-blue-400',
  'Business Standard': 'bg-rose-400',
  'Livemint':          'bg-emerald-400',
  'Hindu BusinessLine':'bg-violet-400',
  'Financial Express': 'bg-sky-400',
};

export default function CareerHubPage() {
  useDocumentTitle('Career');
  const { hasAccess } = useSubscription();
  const [companies, setCompanies] = useState([]);
  const [newsMap, setNewsMap] = useState({});
  const [readinessComponents, setReadinessComponents] = useState([]);

  useEffect(() => {
    getReadiness().then((r) => setReadinessComponents(r.data?.components || [])).catch(() => {});
    listCompanies()
      .then((res) => {
        const top = res.data.slice(0, 6);
        setCompanies(top);
        top.forEach((c) => {
          getCompanyNews(c.name)
            .then((r) => {
              if (r.data?.length) {
                setNewsMap((prev) => ({ ...prev, [c.name]: r.data.slice(0, 2) }));
              }
            })
            .catch(() => {});
        });
      })
      .catch(() => {});
  }, []);

  return (
    <Page className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Career</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Your placement companion — resume, companies and readiness
        </p>
      </div>

      <PlacementCountdown />
      <PlacementJourney components={readinessComponents} />
      <ReadinessCard />

      <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
        {/* Resume */}
        <Link
          to="/career/resume"
          className="card-hover rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900"
        >
          <FileText className="mb-2 h-5 w-5 text-indigo-500" />
          <p className="font-semibold">Resume Builder</p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Build and preview your placement-ready resume
          </p>
        </Link>

        {/* Interview Questions */}
        <Link
          to="/career/questions"
          className="card-hover relative rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900"
        >
          <div className="mb-2 flex items-center justify-between">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            {!hasAccess('pro') && (
              <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                <Lock className="h-2.5 w-2.5" /> Pro
              </span>
            )}
          </div>
          <p className="font-semibold">Interview Question Bank</p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            HR, case, technical and guesstimate questions
          </p>
        </Link>

        {/* Company prep */}
        <div className="card-hover rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-500" />
              <span className="font-semibold">Company prep</span>
            </div>
            <Link
              to="/career/companies"
              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {companies.length === 0 ? (
            <p className="text-sm text-gray-400">No companies added yet.</p>
          ) : (
            <ul className="space-y-3">
              {companies.map((c) => {
                const headlines = newsMap[c.name];
                return (
                  <li key={c._id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-800">
                    <Link
                      to={`/career/companies/${c.slug}`}
                      className="flex items-center justify-between text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400"
                    >
                      <span className="truncate">{c.name}</span>
                      <span className="ml-2 shrink-0 text-[11px] capitalize text-gray-400">
                        {c.sector?.replace('_', ' ')}
                      </span>
                    </Link>
                    {headlines?.length > 0 && (
                      <ul className="mt-1.5 space-y-1">
                        {headlines.map((h, i) => (
                          <li key={i}>
                            <a
                              href={h.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-start gap-1.5"
                            >
                              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SOURCE_DOT[h.source] || 'bg-gray-300'}`} />
                              <span className="line-clamp-1 text-[11px] leading-snug text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400">
                                {h.title}
                              </span>
                              <ExternalLink className="mt-0.5 h-2.5 w-2.5 shrink-0 text-gray-300 group-hover:text-indigo-400 dark:text-gray-600" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!headlines && (
                      <div className="mt-1.5 space-y-1">
                        <div className="h-2.5 w-3/4 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-2.5 w-1/2 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Live news strip — shown only when companies exist */}
      {companies.length > 0 && (
        <div className="mt-6 rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <h2 className="mb-4 flex items-center gap-2 font-semibold">
            <Newspaper className="h-4 w-4 text-indigo-500" />
            Company news
            <span className="ml-auto text-[10px] font-normal text-gray-400">live · updated hourly</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {companies.map((c) => {
              const headlines = newsMap[c.name];
              return (
                <div
                  key={c._id}
                  className="rounded-xl border border-gray-100 p-3.5 dark:border-gray-800"
                >
                  <Link
                    to={`/career/companies/${c.slug}`}
                    className="mb-2 block text-xs font-semibold uppercase tracking-wide text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {c.name}
                  </Link>
                  {!headlines ? (
                    <div className="space-y-2">
                      <div className="h-3 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                      <div className="h-3 w-4/5 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                  ) : headlines.length === 0 ? (
                    <p className="text-xs text-gray-400">No recent news found.</p>
                  ) : (
                    <ul className="space-y-2">
                      {headlines.map((h, i) => (
                        <li key={i}>
                          <a
                            href={h.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block"
                          >
                            <p className="line-clamp-2 text-xs leading-snug text-gray-700 group-hover:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400">
                              {h.title}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${SOURCE_DOT[h.source] || 'bg-gray-300'}`} />
                              <span className="text-[10px] text-gray-400">{h.source}</span>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <UpcomingGrid workspace="career" />
    </Page>
  );
}
