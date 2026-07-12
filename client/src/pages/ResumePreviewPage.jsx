import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Pencil } from 'lucide-react';
import { getMyResume } from '../api/resume';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';

// ATS-friendly on purpose: single column, real selectable text, standard
// section headings, no icons/graphics inside the document itself.
const SectionHeading = ({ children }) => (
  <h2 className="mb-1.5 mt-4 border-b border-gray-300 pb-0.5 text-[13px] font-bold uppercase tracking-wide">
    {children}
  </h2>
);

export default function ResumePreviewPage() {
  const [resume, setResume] = useState();

  useEffect(() => {
    getMyResume().then((res) => setResume(res.data));
  }, []);

  const handleDownload = () => {
    const prev = document.title;
    const name = resume?.personal?.fullName?.trim().replace(/\s+/g, '-') || 'resume';
    document.title = `${name}-Resume`;
    window.print();
    document.title = prev;
  };

  if (resume === undefined) return <Loader />;

  if (!resume) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6">
        <EmptyState
          title="No resume yet"
          subtitle="Fill in your details first"
          action={
            <Link to="/career/resume" className="text-sm font-medium text-indigo-600 hover:underline">
              Go to Resume Builder
            </Link>
          }
        />
      </div>
    );
  }

  const p = resume.personal || {};
  const contactLine = [p.email, p.phone, p.location, p.linkedin, p.website]
    .filter(Boolean)
    .join('  |  ');
  const bullets = (text) => (text || '').split('\n').map((l) => l.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 print:max-w-none print:p-0">
      <style>{`@page { size: A4; margin: 14mm; } @media print { body { background: white; } }`}</style>

      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link to="/career/resume" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex gap-2">
          <Link
            to="/career/resume"
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* The sheet: always paper-white with black text, even in dark mode */}
      <div className="rounded-lg bg-white p-8 text-[12.5px] leading-relaxed text-gray-900 shadow print:rounded-none print:p-0 print:shadow-none">
        <header className="mb-2 text-center">
          <h1 className="text-2xl font-bold tracking-wide">{p.fullName || 'Your Name'}</h1>
          {contactLine && <p className="mt-1 text-[11.5px] text-gray-700">{contactLine}</p>}
        </header>

        {resume.summary && (
          <>
            <SectionHeading>Summary</SectionHeading>
            <p>{resume.summary}</p>
          </>
        )}

        {resume.education?.length > 0 && (
          <>
            <SectionHeading>Education</SectionHeading>
            {resume.education.map((e, i) => (
              <div key={i} className="mb-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{e.degree}</span>
                  <span className="text-gray-600">{e.years}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span>{e.institution}</span>
                  {e.score && <span className="text-gray-600">{e.score}</span>}
                </div>
              </div>
            ))}
          </>
        )}

        {resume.experience?.length > 0 && (
          <>
            <SectionHeading>Experience</SectionHeading>
            {resume.experience.map((e, i) => (
              <div key={i} className="mb-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">
                    {e.role}
                    {e.organization && ` — ${e.organization}`}
                  </span>
                  <span className="text-gray-600">{e.duration}</span>
                </div>
                <ul className="ml-4 list-disc">
                  {bullets(e.description).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </>
        )}

        {resume.projects?.length > 0 && (
          <>
            <SectionHeading>Projects</SectionHeading>
            {resume.projects.map((pr, i) => (
              <div key={i} className="mb-1.5">
                <span className="font-semibold">{pr.title}</span>
                {pr.link && <span className="text-gray-600"> ({pr.link})</span>}
                {pr.description && <p>{pr.description}</p>}
              </div>
            ))}
          </>
        )}

        {resume.skills?.length > 0 && (
          <>
            <SectionHeading>Skills</SectionHeading>
            <p>{resume.skills.join(' · ')}</p>
          </>
        )}

        {resume.certifications?.length > 0 && (
          <>
            <SectionHeading>Certifications</SectionHeading>
            <ul className="ml-4 list-disc">
              {resume.certifications.map((c, i) => (
                <li key={i}>
                  {c.name}
                  {c.issuer && ` — ${c.issuer}`}
                  {c.year && ` (${c.year})`}
                </li>
              ))}
            </ul>
          </>
        )}

        {resume.achievements?.length > 0 && (
          <>
            <SectionHeading>Achievements</SectionHeading>
            <ul className="ml-4 list-disc">
              {resume.achievements.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </>
        )}

        {resume.leadership?.length > 0 && (
          <>
            <SectionHeading>Leadership & Extracurricular</SectionHeading>
            <ul className="ml-4 list-disc">
              {resume.leadership.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-gray-400 print:hidden">
        Tip: in the print dialog choose "Save as PDF" as the destination.
      </p>
    </div>
  );
}
