import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Building2, MessageSquare, ArrowRight, ExternalLink, Lock } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useSubscription } from '../../context/SubscriptionContext';
import { listCompanies, getCompanyNews } from '../../api/companies';
import ReadinessCard from '../../components/common/ReadinessCard';
import PlacementCountdown from '../../components/career/PlacementCountdown';
import PlacementJourney from '../../components/career/PlacementJourney';
import { getReadiness } from '../../api/readiness';
import { Page } from '../../components/common/motion';
import { Skeleton } from '../../components/common/Skeleton';

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

  const dateLabel = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  });

  return (
    <Page>
      {/* TOP BAR — date only */}
      <div className="flex items-center justify-between py-4">
        <span className="text-xs font-medium tracking-wide text-gray-400">
          Career
        </span>
        <span className="text-xs font-medium tracking-wide text-gray-400">
          {dateLabel}
        </span>
      </div>

      {/* PLACEMENT JOURNEY — the 5-step horizontal line is the signature */}
      <div className="py-8">
        <PlacementJourney components={readinessComponents} />
      </div>

      {/* PLACEMENT COUNTDOWN — compact alert */}
      <PlacementCountdown />

      {/* READINESS — compact */}
      <ReadinessCard />

      {/* TOOLS — resume, questions, companies as icon row */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <Link
          to="/career/resume"
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-4 text-center transition-colors hover:border-indigo-200 hover:bg-indigo-50/30 dark:border-gray-800/80 dark:bg-gray-900 dark:hover:border-indigo-800/60 dark:hover:bg-indigo-950/20"
        >
          <FileText className="h-5 w-5 text-indigo-500" />
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Resume</p>
            <p className="text-[10px] text-gray-400">Build & preview</p>
          </div>
        </Link>

        <Link
          to="/career/questions"
          className="relative flex flex-col items-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-4 text-center transition-colors hover:border-indigo-200 hover:bg-indigo-50/30 dark:border-gray-800/80 dark:bg-gray-900 dark:hover:border-indigo-800/60 dark:hover:bg-indigo-950/20"
        >
          <div className="relative">
            <MessageSquare className="h-5 w-5 text-indigo-500" />
            {!hasAccess('pro') && (
              <Lock className="absolute -right-2 -top-1.5 h-3 w-3 text-amber-500" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Questions</p>
            <p className="text-[10px] text-gray-400">Interview prep</p>
          </div>
        </Link>

        <Link
          to="/career/companies"
          className="flex flex-col items-center gap-2 rounded-2xl border border-gray-200/80 bg-white p-4 text-center transition-colors hover:border-indigo-200 hover:bg-indigo-50/30 dark:border-gray-800/80 dark:bg-gray-900 dark:hover:border-indigo-800/60 dark:hover:bg-indigo-950/20"
        >
          <Building2 className="h-5 w-5 text-indigo-500" />
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">Companies</p>
            <p className="text-[10px] text-gray-400">Target tracker</p>
          </div>
        </Link>
      </div>

      {/* COMPANY NEWS — compact strip */}
      {companies.length > 0 && (
        <>
          <div className="border-t border-gray-200/60 dark:border-gray-800/60" />
          <div className="py-6">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Company news
              <span className="ml-auto text-[10px] font-normal lowercase tracking-normal text-gray-400">live</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {companies.map((c) => {
                const headlines = newsMap[c.name];
                return (
                  <div key={c._id} className="rounded-xl border border-gray-100 p-3 dark:border-gray-800">
                    <Link
                      to={`/career/companies/${c.slug}`}
                      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {c.name}
                    </Link>
                    {!headlines ? (
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    ) : headlines.length === 0 ? (
                      <p className="text-xs text-gray-400">No recent news.</p>
                    ) : (
                      <ul className="space-y-1.5">
                        {headlines.map((h, i) => (
                          <li key={i}>
                            <a href={h.link} target="_blank" rel="noopener noreferrer" className="group block">
                              <p className="line-clamp-2 text-xs leading-snug text-gray-700 group-hover:text-indigo-600 dark:text-gray-300 dark:group-hover:text-indigo-400">
                                {h.title}
                              </p>
                              <div className="mt-1 flex items-center gap-1">
                                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${SOURCE_DOT[h.source] || 'bg-gray-300'}`} />
                                <span className="text-[10px] text-gray-400">{h.source}</span>
                                <ExternalLink className="h-2.5 w-2.5 text-gray-300 group-hover:text-indigo-400 dark:text-gray-600" />
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
        </>
      )}
    </Page>
  );
}
