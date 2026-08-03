import React, { useEffect, useState } from 'react';
import {
  X, ArrowLeft, FileText, ListTodo, ClipboardList, Clock, Layers,
  Calendar, RefreshCw, ExternalLink, HelpCircle, AlertTriangle,
} from 'lucide-react';
import { fetchLectureByIdApi, type Lesson } from '../lib/api/lectures';

interface LectureDetailDrawerProps {
  lectureId: number;
  courseName?: string;
  moduleName?: string;
  onClose: () => void;
}

const typeCfg: Record<string, { label: string; icon: React.ElementType }> = {
  LECTURE:    { label: 'Lecture',    icon: FileText },
  TASK:       { label: 'Task',       icon: ListTodo },
  ASSIGNMENT: { label: 'Assignment', icon: ClipboardList },
};

const statusCfg: Record<string, { label: string; cls: string }> = {
  DRAFT:     { label: 'Draft',     cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  PUBLISHED: { label: 'Published', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  ARCHIVED:  { label: 'Archived',  cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—';

type AttachmentKind = 'video' | 'document' | 'link';

const getAttachmentKind = (url: string): AttachmentKind => {
  const lower = url.toLowerCase();
  if (/\.(mp4|webm|ogg|mov|m3u8)(\?|$)/.test(lower) || /youtube\.com|youtu\.be|vimeo\.com/.test(lower)) return 'video';
  if (/\.(pdf|docx?|pptx?|xlsx?|csv|txt)(\?|$)/.test(lower)) return 'document';
  return 'link';
};

const getVideoEmbedUrl = (url: string): string | null => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
};

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="border border-dashed border-slate-200 rounded-xl py-6 text-center">
    <p className="text-xs font-semibold text-slate-400">{label}</p>
  </div>
);

const MetaTile: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-2.5 px-3.5 py-3 bg-slate-50 border border-slate-100 rounded-xl min-w-0">
    <Icon className="h-4 w-4 text-slate-400 shrink-0" />
    <div className="min-w-0">
      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

const LectureContent: React.FC<{ lecture: Lesson }> = ({ lecture }) => {
  const type = typeCfg[lecture.contentType] ?? typeCfg.LECTURE;
  const TypeIcon = type.icon;
  const status = statusCfg[lecture.status] ?? statusCfg.DRAFT;
  const attachmentKind = lecture.pdfUrl ? getAttachmentKind(lecture.pdfUrl) : null;
  const embedUrl = lecture.pdfUrl ? getVideoEmbedUrl(lecture.pdfUrl) : null;

  return (
    <>
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">
            <TypeIcon className="h-3 w-3" /> {type.label}
          </span>
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold border uppercase tracking-wider ${status.cls}`}>
            {status.label}
          </span>
        </div>
        <h1 className="text-xl font-extrabold text-[#001D6E] leading-snug">{lecture.title}</h1>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <MetaTile icon={Clock}    label="Duration" value={lecture.estimatedDurationMinutes ? `${lecture.estimatedDurationMinutes} min` : '—'} />
        <MetaTile icon={Layers}   label="Order"    value={`#${lecture.displayOrder}`} />
        <MetaTile icon={Calendar} label="Created"  value={formatDate(lecture.createdAt)} />
        <MetaTile icon={Calendar} label="Updated"  value={formatDate(lecture.updatedAt)} />
      </div>

      {/* Description */}
      <section>
        <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Description</h2>
        {lecture.description
          ? <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{lecture.description}</p>
          : <EmptyState label="No description added for this lecture." />}
      </section>

      {/* Notes / body content */}
      <section>
        <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Notes</h2>
        {lecture.content
          ? <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{lecture.content}</p>
          : <EmptyState label="No notes added for this lecture." />}
      </section>

      {/* Attachment: video / document / resource link (single attachment field, rendered by detected kind) */}
      <section>
        <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
          {attachmentKind === 'video' ? 'Video' : attachmentKind === 'document' ? 'Document' : 'Resources'}
        </h2>
        {!lecture.pdfUrl && <EmptyState label="No attachment or resource added for this lecture." />}
        {lecture.pdfUrl && attachmentKind === 'video' && embedUrl && (
          <div className="aspect-video rounded-xl overflow-hidden border border-slate-200">
            <iframe src={embedUrl} title={lecture.title} className="w-full h-full" allowFullScreen />
          </div>
        )}
        {lecture.pdfUrl && attachmentKind === 'video' && !embedUrl && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video controls src={lecture.pdfUrl} className="w-full rounded-xl border border-slate-200" />
        )}
        {lecture.pdfUrl && attachmentKind !== 'video' && (
          <a
            href={lecture.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all"
          >
            <FileText className="h-4 w-4" />
            {attachmentKind === 'document' ? 'Open Document' : 'Open Resource'}
            <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-60" />
          </a>
        )}
      </section>

      {/* Assignment-specific details */}
      {lecture.contentType === 'ASSIGNMENT' && (
        <section>
          <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Assignment Details</h2>
          <div className="grid grid-cols-2 gap-2.5">
            <MetaTile icon={ClipboardList} label="Max Marks"       value={lecture.maxMarks !== null ? String(lecture.maxMarks) : '—'} />
            <MetaTile icon={Calendar}       label="Due Date"        value={formatDate(lecture.dueDate)} />
            <MetaTile icon={RefreshCw}      label="Late Submission" value={lecture.lateSubmissionAllowed ? 'Allowed' : 'Not Allowed'} />
            <MetaTile icon={Calendar}       label="Late Deadline"   value={formatDate(lecture.lateSubmissionDeadline)} />
          </div>
        </section>
      )}

      {/* Quiz — not supported by the backend yet, always shown as an empty state */}
      <section>
        <h2 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">Quiz</h2>
        <div className="border border-dashed border-slate-200 rounded-xl py-6 text-center">
          <HelpCircle className="h-5 w-5 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs font-semibold text-slate-400">No quiz added for this lecture yet.</p>
        </div>
      </section>
    </>
  );
};

const LectureDetailDrawer: React.FC<LectureDetailDrawerProps> = ({ lectureId, courseName, moduleName, onClose }) => {
  const [lecture, setLecture] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchLectureByIdApi(lectureId)
      .then(setLecture)
      .catch(() => setError('Failed to load lecture details.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [lectureId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Lecture details">
      <div className="bg-[#F8FAFC] h-full w-full max-w-xl shadow-2xl overflow-y-auto">

        {/* Back / breadcrumb / close */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Lectures
            </button>
            <button
              onClick={onClose}
              aria-label="Close lecture details"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {(courseName || moduleName) && (
            <nav className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">
              {courseName && <span className="truncate max-w-[160px]">{courseName}</span>}
              {courseName && moduleName && <span className="text-slate-300">/</span>}
              {moduleName && <span className="truncate max-w-[160px]">{moduleName}</span>}
            </nav>
          )}
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="py-16 text-center">
              <RefreshCw className="h-5 w-5 text-slate-300 mx-auto mb-2 animate-spin" />
              <p className="text-xs font-semibold text-slate-400">Loading lecture...</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-16 text-center">
              <AlertTriangle className="h-6 w-6 text-red-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-red-500 mb-3">{error}</p>
              <button
                onClick={load}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && lecture && <LectureContent lecture={lecture} />}
        </div>
      </div>
    </div>
  );
};

export default LectureDetailDrawer;
