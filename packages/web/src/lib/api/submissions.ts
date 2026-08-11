import api from '../axios';

export type SubmissionStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'REVIEWED' | 'RESUBMISSION_REQUIRED';

export interface LectureSubmission {
  lectureId:       number;
  attemptNo:       number;
  status:          SubmissionStatus;
  submissionUrl:   string | null;
  remarks:         string | null;
  marksObtained:   number | null;
  trainerFeedback: string | null;
  createdAt:       string | null;
}

interface ApiSubmission {
  submission_id:     string;
  lecture_id:        number;
  enrollment_id:      number;
  attempt_no:         number;
  submission_url:     string | null;
  remarks:            string | null;
  marks_obtained:     number | null;
  trainer_feedback:   string | null;
  submission_status:  SubmissionStatus;
  created_at:         string | null;
}

const mapSubmission = (s: ApiSubmission): LectureSubmission => ({
  lectureId:       s.lecture_id,
  attemptNo:       s.attempt_no,
  status:          s.submission_status,
  submissionUrl:   s.submission_url,
  remarks:         s.remarks,
  marksObtained:   s.marks_obtained,
  trainerFeedback: s.trainer_feedback,
  createdAt:       s.created_at,
});

export const fetchEnrollmentSubmissions = (enrollmentId: number) =>
  api
    .get<{ success: boolean; data: ApiSubmission[] }>(`/enrollments/${enrollmentId}/submissions`)
    .then((r) => r.data.data.map(mapSubmission));

export interface CreateSubmissionPayload {
  submissionUrl?: string;
  remarks?:       string;
}

export const createSubmissionApi = (
  enrollmentId: number,
  lectureId: number,
  payload: CreateSubmissionPayload,
) =>
  api
    .post<{ success: boolean; data: ApiSubmission }>(
      `/enrollments/${enrollmentId}/lectures/${lectureId}/submissions`,
      payload,
    )
    .then((r) => mapSubmission(r.data.data));

export interface ReviewSubmissionPayload {
  submission_status: 'UNDER_REVIEW' | 'REVIEWED' | 'RESUBMISSION_REQUIRED';
  marks_obtained?:   number;
  trainer_feedback?: string;
}

export const reviewSubmissionApi = (submissionId: string, payload: ReviewSubmissionPayload) =>
  api
    .patch<{ success: boolean; data: ApiSubmission }>(`/submissions/${submissionId}/review`, payload)
    .then((r) => mapSubmission(r.data.data));

export interface RecentSubmission {
  submission_id:    string;
  student_name:     string;
  assignment_title: string;
  course_name:      string;
  submission_status: SubmissionStatus;
  attempt_no:       number;
  marks_obtained:   number | null;
  submitted_at:     string | null;
}

export const fetchRecentSubmissionsApi = (limit = 10) =>
  api
    .get<{ success: boolean; data: RecentSubmission[] }>('/submissions/recent', { params: { limit } })
    .then((r) => r.data.data);
