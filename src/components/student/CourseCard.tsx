import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export type Course = {
  id: string;
  title: string;
  track: string;
  imageBg: string;
  imageSvg: React.ReactNode;
  isRequired?: boolean;
  status: 'in-progress' | 'completed';
  progressLabel: string;
  progressPercent: number;
  completedDate?: string;
  actionLabel: string;
  actionIcon?: React.ReactNode;
}

interface CourseCardProps {
  course: Course;
  onAction?: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onAction }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm shadow-slate-900/5 hover:shadow-md hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between">
      {/* Thumbnail */}
      <div className={`h-40 bg-gradient-to-br ${course.imageBg} relative flex items-center justify-center p-6 overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="relative transform group-hover:scale-105 transition-transform duration-300">
          {course.imageSvg}
        </div>
        {course.isRequired && (
          <span className="absolute top-4 left-4 bg-white/95 text-blue-700 text-[9px] font-extrabold px-2.5 py-1 rounded-md shadow-sm border border-blue-50">
            ● Required
          </span>
        )}
        {course.status === 'completed' && (
          <div className="absolute top-4 right-4 bg-emerald-500 text-white p-1 rounded-full shadow-sm ring-4 ring-white/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider block mb-1">
            {course.track}
          </span>
          <h3 className="font-extrabold text-sm text-slate-900 leading-snug hover:text-blue-600 cursor-pointer transition-colors">
            {course.title}
          </h3>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          {course.status === 'in-progress' ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-slate-400">{course.progressLabel}</span>
                <span className="text-blue-700">{course.progressPercent}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${course.progressPercent}%` }}
                />
              </div>
              <button
                onClick={onAction}
                className="w-full py-2 border border-blue-600/80 hover:bg-blue-50 text-blue-700 text-xs font-bold rounded-lg transition-colors"
              >
                {course.actionLabel}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold">
                <span className="text-emerald-600 uppercase flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Completed
                </span>
                <span className="text-slate-400">{course.completedDate}</span>
              </div>
              <div className="h-1.5 bg-emerald-500 rounded-full w-full" />
              <button
                onClick={onAction}
                className="w-full py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {course.actionIcon}
                <span>{course.actionLabel}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
