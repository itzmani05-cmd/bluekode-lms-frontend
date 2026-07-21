import api from '../axios';
import { mapEnrollment } from './enrollments';
import type { ApiEnrollment, StudentEnrollment } from './enrollments';

export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export interface LectureProgress {
  lectureId:      number;
  status:         ProgressStatus;
  completionDate: string | null;
}

interface ApiProgress {
  progress_id:     string | number;
  enrollment_id:   number;
  lecture_id:      number;
  progress_status: ProgressStatus;
  completion_date: string | null;
}

const mapProgress = (p: ApiProgress): LectureProgress => ({
  lectureId:      p.lecture_id,
  status:         p.progress_status,
  completionDate: p.completion_date,
});

export const fetchEnrollmentProgress = (enrollmentId: number) =>
  api
    .get<{ success: boolean; data: ApiProgress[] }>(`/enrollments/${enrollmentId}/progress`)
    .then((r) => r.data.data.map(mapProgress));

export interface MarkCompleteResult {
  progress:   LectureProgress;
  enrollment: StudentEnrollment;
}

export const markLectureCompleteApi = (enrollmentId: number, lectureId: number) =>
  api
    .post<{ success: boolean; data: { progress: ApiProgress; enrollment: ApiEnrollment } }>(
      `/enrollments/${enrollmentId}/lectures/${lectureId}/complete`,
    )
    .then((r) => ({
      progress:   mapProgress(r.data.data.progress),
      enrollment: mapEnrollment(r.data.data.enrollment),
    }));
