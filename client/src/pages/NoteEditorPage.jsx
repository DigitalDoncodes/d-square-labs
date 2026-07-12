import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getNote, createNote, updateNote } from '../api/notes';
import { SUBJECTS } from '../utils/constants';

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900';

export default function NoteEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { register, handleSubmit, reset, formState } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      getNote(id).then((res) => {
        const { title, subject, semester, content } = res.data;
        reset({ title, subject, semester, content });
      });
    }
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateNote(id, data);
        toast.success('Note updated');
        navigate(`/study/notes/${id}`);
      } else {
        const res = await createNote(data);
        toast.success('Note created');
        navigate(`/study/notes/${res.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save note');
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-xl font-bold">{isEdit ? 'Edit note' : 'New note'}</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
      >
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">Title</label>
          <input id="title" {...register('title', { required: true })} className={inputClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium">Subject</label>
            <select id="subject" {...register('subject', { required: true })} className={inputClass}>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="semester" className="mb-1 block text-sm font-medium">
              Semester <span className="text-gray-400">(optional)</span>
            </label>
            <input id="semester" {...register('semester')} placeholder="e.g. Sem 2" className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium">Content</label>
          <textarea
            id="content"
            rows={12}
            {...register('content')}
            placeholder="Write your notes here…"
            className={inputClass}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formState.isSubmitting}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {formState.isSubmitting ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </form>
    </div>
  );
}
