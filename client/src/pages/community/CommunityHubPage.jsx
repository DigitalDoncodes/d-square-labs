import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Camera, Clapperboard, MessageSquare, ArrowRight, Pin } from 'lucide-react';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { listAnnouncements } from '../../api/admin';
import { listPosts } from '../../api/posts';
import { formatDate } from '../../utils/dateUtils';
import { FeedSkeleton } from '../../components/common/Skeleton';
import UpcomingGrid from '../../components/common/UpcomingGrid';
import { Page } from '../../components/common/motion';

export default function CommunityHubPage() {
  useDocumentTitle('Community');
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.allSettled([listAnnouncements(), listPosts({ limit: 4 })]).then(
      ([announcementsRes, postsRes]) => {
        const announcements = announcementsRes.status === 'fulfilled' ? announcementsRes.value.data.slice(0, 3) : [];
        const raw = postsRes.status === 'fulfilled' ? postsRes.value.data : {};
        const posts = (raw.posts || raw).slice(0, 4);
        setData({ announcements, posts });
      }
    );
  }, []);

  if (!data) return <div className="mx-auto max-w-5xl px-4 py-6"><FeedSkeleton count={4} /></div>;

  return (
    <Page className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold">Community</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Everything the batch shares</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Discussions — the main social feed */}
        <div className="card-hover rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <MessageSquare className="h-4 w-4 text-indigo-500" /> Discussions
            </h2>
            <Link to="/community/discussions" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.posts.length === 0 ? (
            <div>
              <p className="text-sm text-gray-400">No discussions yet.</p>
              <Link to="/community/discussions" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                Start the first one <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {data.posts.map((p) => (
                <li key={p._id}>
                  <Link to="/community/discussions" className="block text-sm hover:text-indigo-600">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="text-xs text-gray-400">
                      {p.author?.name} · {p.replyCount} repl{p.replyCount === 1 ? 'y' : 'ies'} · {formatDate(p.createdAt)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Announcements */}
        <div className="card-hover rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <Megaphone className="h-4 w-4 text-indigo-500" /> Announcements
            </h2>
            <Link to="/community/announcements" className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.announcements.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing announced yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {data.announcements.map((a) => (
                <li key={a._id} className="text-sm">
                  <p className="font-medium">
                    {a.pinned && <Pin className="mr-1 inline h-3 w-3 text-amber-500" />}
                    {a.title}
                  </p>
                  <p className="text-xs text-gray-400">{a.createdBy?.name} · {formatDate(a.createdAt)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Gallery */}
        <Link to="/community/gallery" className="card-hover block rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <Camera className="mb-2 h-5 w-5 text-indigo-500" />
          <p className="font-semibold">Gallery</p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Batch albums and photos</p>
        </Link>

        {/* Archive */}
        <Link to="/community/archive" className="card-hover block rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-gray-900">
          <Clapperboard className="mb-2 h-5 w-5 text-indigo-500" />
          <p className="font-semibold">Nostalgia Archive</p>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Entertainment picks, memories and throwbacks</p>
        </Link>
      </div>

      <UpcomingGrid workspace="community" />
    </Page>
  );
}
