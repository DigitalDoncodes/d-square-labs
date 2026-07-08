import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Image, Trash2, Upload } from 'lucide-react';
import { getAlbum, listAlbumPhotos } from '../api/albums';
import { uploadPhoto, deletePhoto } from '../api/photos';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

export default function AlbumDetailPage() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [photos, setPhotos] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const { user } = useAuth();

  const load = () => {
    getAlbum(id).then((res) => setAlbum(res.data));
    listAlbumPhotos(id).then((res) => setPhotos(res.data));
  };
  useEffect(load, [id]);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('albumId', id);
      try {
        await uploadPhoto(formData);
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
    toast.success('Upload complete');
    load();
  };

  const handleDelete = async (photoId) => {
    if (!window.confirm('Delete this photo?')) return;
    await deletePhoto(photoId);
    toast.success('Photo deleted');
    load();
  };

  if (!album || !photos) return <Loader />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link to="/albums" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> All albums
      </Link>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{album.title}</h1>
          {album.description && <p className="text-sm text-gray-500">{album.description}</p>}
        </div>
        <button
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" /> {uploading ? 'Uploading…' : 'Add photos'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleFiles([...e.target.files])}
        />
      </div>

      {photos.length === 0 ? (
        <EmptyState icon={Image} title="No photos yet" subtitle="Add the first memory to this album" />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo._id} className="group relative overflow-hidden rounded-xl">
              <img
                src={photo.url}
                alt={photo.caption || 'Batch photo'}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              {photo.uploadedBy?._id === user?.id && (
                <button
                  onClick={() => handleDelete(photo._id)}
                  aria-label="Delete photo"
                  className="absolute right-2 top-2 hidden rounded-lg bg-black/60 p-1.5 text-white group-hover:block"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <p className="absolute bottom-0 w-full bg-gradient-to-t from-black/60 to-transparent px-2 pb-1 pt-4 text-xs text-white">
                {photo.uploadedBy?.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
