import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { FileText, FileSpreadsheet, Link2, Video, Download, Search, Plus, ExternalLink, Upload, Sparkles } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { listResources, createResource, uploadResourceFile, deleteResource, downloadResource } from '../../api/resources';
import { FeedSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { useAuth } from '../../context/AuthContext';
import { Page } from '../../components/common/motion';

const inputClass = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900';

const TYPE_ICONS = {
  pdf: FileText, word: FileText, excel: FileSpreadsheet, ppt: FileText,
  zip: FileText, video: Video, link: Link2,
};

const TYPE_COLORS = {
  pdf: 'text-red-500', word: 'text-blue-500', excel: 'text-green-600',
  ppt: 'text-orange-500', zip: 'text-yellow-600', video: 'text-purple-500', link: 'text-indigo-500',
};

const TYPES = ['pdf', 'word', 'excel', 'ppt', 'zip', 'video', 'link'];

export default function ResourcesPage() {
  useDocumentTitle('Resource Library');
  const { user } = useAuth();
  const [items, setItems] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showAdd, setShowAdd] = useState(false);
  const [addTab, setAddTab] = useState('link'); // 'link' | 'file'
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const load = () => {
    const params = {};
    if (typeFilter) params.type = typeFilter;
    if (search) params.search = search;
    if (sortBy === 'downloads') params.sort = 'downloads';
    listResources(params).then((r) => setItems(r.data)).catch(() => setItems([]));
  };

  useEffect(() => { load(); }, [typeFilter, search, sortBy]);

  const onAddLink = async (data) => {
    try {
      const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
      await createResource({ ...data, tags });
      toast.success('Resource added');
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const onUploadFile = async (data) => {
    if (!selectedFile) return toast.error('Please select a file');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', selectedFile);
      fd.append('title', data.title);
      if (data.subject) fd.append('subject', data.subject);
      if (data.semester) fd.append('semester', data.semester);
      if (data.professor) fd.append('professor', data.professor);
      if (data.tags) fd.append('tags', data.tags);
      await uploadResourceFile(fd);
      toast.success('File uploaded');
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const closeModal = () => {
    setShowAdd(false);
    setSelectedFile(null);
    setAddTab('link');
    reset();
  };

  const handleOpen = async (item) => {
    downloadResource(item._id).catch(() => {});
    window.open(item.url, '_blank', 'noopener');
    setItems((prev) => prev.map((i) => i._id === item._id ? { ...i, downloads: i.downloads + 1 } : i));
  };

  return (
    <Page className="mx-auto max-w-4xl px-4 py-6">
      <PageHeader
        icon={FileText}
        title="Resource Library"
        subtitle="Notes, PDFs, spreadsheets and links — all in one place"
        action={{ label: 'Add Resource', onClick: () => setShowAdd(true), icon: Plus }}
      />

      <div className="mb-4 flex gap-2 flex-wrap">
        {['', ...TYPES].map((t) => (
          <button
            key={t || 'all'}
            onClick={() => setTypeFilter(t)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${typeFilter === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, professor, tags…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900" />
        </div>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900">
          <option value="newest">Newest</option>
          <option value="downloads">Most downloaded</option>
        </select>
      </div>

      {items === null ? <FeedSkeleton count={4} /> : items.length === 0 ? (
        <EmptyState icon={FileText} title="No resources yet" description="Add the first resource for your batch" cta={{ label: 'Add Resource', onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = TYPE_ICONS[item.type] || FileText;
            const iconColor = TYPE_COLORS[item.type] || 'text-gray-500';
            return (
              <div key={item._id} className="group rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-gray-800/80 dark:bg-gray-900">
                <div className="mb-3 flex items-start gap-3">
                  <Icon className={`h-8 w-8 shrink-0 ${iconColor}`} />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-gray-500">{[item.subject, item.professor].filter(Boolean).join(' · ')}</p>
                  </div>
                </div>
                <div className="mb-3 flex flex-wrap gap-1">
                  {item.tags?.map((t) => <span key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{t}</span>)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Download className="h-3.5 w-3.5" />{item.downloads}</span>
                  <button onClick={() => handleOpen(item)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-indigo-700">
                    Open <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={closeModal} title="Add Resource">
        {user?.role === 'admin' && (
          <Link
            to="/admin/studio?dest=resources"
            className="mb-4 flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Admin tip: upload via the Content Studio for AI-filled metadata →
          </Link>
        )}
        {/* Tab switcher */}
        <div className="mb-4 flex rounded-xl border border-gray-200 p-1 dark:border-gray-700">
          {[['link', 'Link / URL'], ['file', 'Upload File']].map(([key, label]) => (
            <button key={key} onClick={() => setAddTab(key)}
              className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors ${addTab === key ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>
              {label}
            </button>
          ))}
        </div>

        {addTab === 'link' ? (
          <form onSubmit={handleSubmit(onAddLink)} className="space-y-3">
            <input {...register('title', { required: true })} placeholder="Title *" className={inputClass} />
            <input {...register('url', { required: true })} placeholder="URL / link *" className={inputClass} />
            <select {...register('type')} className={inputClass}>
              {TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.toUpperCase()}</option>)}
            </select>
            <input {...register('subject')} placeholder="Subject" className={inputClass} />
            <input {...register('semester')} placeholder="Semester (e.g. Sem 2)" className={inputClass} />
            <input {...register('professor')} placeholder="Professor name" className={inputClass} />
            <input {...register('tags')} placeholder="Tags (comma-separated)" className={inputClass} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">Add</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit(onUploadFile)} className="space-y-3">
            <input {...register('title', { required: true })} placeholder="Title *" className={inputClass} />
            <div
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-6 hover:border-indigo-400 dark:border-gray-700"
            >
              <Upload className="h-7 w-7 text-gray-400" />
              {selectedFile ? (
                <p className="text-sm font-medium text-indigo-600">{selectedFile.name}</p>
              ) : (
                <p className="text-sm text-gray-500">Click to select a file (PDF, PPT, Word, Excel, ZIP, Video · max 50 MB)</p>
              )}
              <input ref={fileRef} type="file" className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.mp4,.webm"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)} />
            </div>
            <input {...register('subject')} placeholder="Subject" className={inputClass} />
            <input {...register('semester')} placeholder="Semester (e.g. Sem 2)" className={inputClass} />
            <input {...register('professor')} placeholder="Professor name" className={inputClass} />
            <input {...register('tags')} placeholder="Tags (comma-separated)" className={inputClass} />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={closeModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">Cancel</button>
              <button type="submit" disabled={uploading} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </Page>
  );
}
