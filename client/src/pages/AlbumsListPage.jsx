import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Camera, Plus, Image } from 'lucide-react';
import { listAlbums, createAlbum } from '../api/albums';
import { formatDate } from '../utils/dateUtils';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700';

export default function AlbumsListPage() {
  const [albums, setAlbums] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState } = useForm();

  const load = () => listAlbums().then((res) => setAlbums(res.data));
  useEffect(() => {
    load();
  }, []);

  const onCreate = async (data) => {
    try {
      await createAlbum(data);
      toast.success('Album created');
      reset();
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create album');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Photo Albums</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> New album
        </button>
      </div>

      {!albums ? (
        <Loader />
      ) : albums.length === 0 ? (
        <EmptyState
          icon={Camera}
          title="No albums yet"
          subtitle="Create an album for your first batch memory"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Link
              key={album._id}
              to={`/albums/${album._id}`}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex h-36 items-center justify-center bg-gray-100 dark:bg-gray-800">
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.title} className="h-full w-full object-cover" />
                ) : (
                  <Image className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h2 className="font-semibold">{album.title}</h2>
                <p className="text-xs text-gray-400">
                  {album.photoCount} photo{album.photoCount !== 1 && 's'} · {formatDate(album.createdAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New album">
        <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
          <div>
            <label htmlFor="album-title" className="mb-1 block text-sm font-medium">Title</label>
            <input
              id="album-title"
              {...register('title', { required: true })}
              placeholder="e.g. Orientation Week"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="album-desc" className="mb-1 block text-sm font-medium">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <input id="album-desc" {...register('description')} className={inputClass} />
          </div>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Create album
          </button>
        </form>
      </Modal>
    </div>
  );
}
