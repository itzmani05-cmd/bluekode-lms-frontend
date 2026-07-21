import React from 'react';
import { X, BookOpen, ClipboardCheck, BarChart3, Users } from 'lucide-react';

interface LearnMoreModalProps {
  onClose: () => void;
}

const features = [
  { Icon: BookOpen,       title: 'Structured Courses',   text: 'Modules and lessons are unlocked one at a time as you complete them.' },
  { Icon: ClipboardCheck, title: 'Assignments',          text: 'Submit assignments and track review status, marks, and feedback in one place.' },
  { Icon: BarChart3,      title: 'Progress Tracking',    text: 'Course completion updates automatically as lessons are marked viewed.' },
  { Icon: Users,          title: 'Role-based Access',    text: 'Students, trainers, and admins each get a workspace tailored to their role.' },
];

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md relative">
      <div className="absolute top-0 inset-x-0 h-1 bg-blue-600 rounded-t-2xl" />

      <div className="px-6 pt-6 pb-2 flex items-center justify-between">
        <h2 className="text-base font-extrabold text-[#001D6E]">About Bluekode LMS</h2>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-6 py-4 space-y-4">
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          Bluekode LMS is a learning management platform for delivering courses, tracking
          assignments, and managing students, trainers, and institutions in one place.
        </p>

        <div className="space-y-3">
          {features.map(({ Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="mt-0.5 h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default LearnMoreModal;
