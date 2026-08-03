import api from '../axios';
import type { ContentType, LessonStatus } from '../../store/Admin';

interface ApiLecture {
  lecture_id:                 number;
  module_id:                  number;
  content_type:               ContentType;
  title:                      string;
  description:                string | null;
  content:                    string | null;
  display_order:              number;
  lecture_status:             LessonStatus;
  pdf_url:                    string | null;
  estimated_duration_minutes: number | null;
  due_date:                   string | null;
  max_marks:                  number | null;
  assignment_status:          string | null;
  late_submission_allowed:    boolean;
  late_submission_deadline:   string | null;
  created_at:                 string;
  updated_at:                 string;
}

export interface Lesson {
  id:                       number;
  moduleId:                 number;
  contentType:              ContentType;
  title:                    string;
  description:              string;
  content:                  string;
  displayOrder:             number;
  status:                   LessonStatus;
  pdfUrl:                   string | null;
  estimatedDurationMinutes: number | null;
  dueDate:                  string | null;
  maxMarks:                 number | null;
  assignmentStatus:         string | null;
  lateSubmissionAllowed:    boolean;
  lateSubmissionDeadline:   string | null;
  createdAt:                string;
  updatedAt:                string;
}

const mapLecture = (l: ApiLecture): Lesson => ({
  id:                       l.lecture_id,
  moduleId:                 l.module_id,
  contentType:              l.content_type,
  title:                    l.title,
  description:              l.description ?? '',
  content:                  l.content ?? '',
  displayOrder:             l.display_order,
  status:                   l.lecture_status,
  pdfUrl:                   l.pdf_url,
  estimatedDurationMinutes: l.estimated_duration_minutes,
  dueDate:                  l.due_date ? l.due_date.split('T')[0] : null,
  maxMarks:                 l.max_marks,
  assignmentStatus:         l.assignment_status,
  lateSubmissionAllowed:    l.late_submission_allowed,
  lateSubmissionDeadline:   l.late_submission_deadline,
  createdAt:                l.created_at,
  updatedAt:                l.updated_at,
});

export interface CreateLessonPayload {
  contentType:              ContentType;
  title:                    string;
  description?:             string;
  content?:                 string;
  lectureStatus:            LessonStatus;
  pdfUrl?:                  string;
  estimatedDurationMinutes?: number;
  dueDate?:                 string;
  maxMarks?:                number;
}

export interface UpdateLessonPayload {
  contentType?:              ContentType;
  title?:                    string;
  description?:              string;
  content?:                  string;
  lectureStatus?:            LessonStatus;
  pdfUrl?:                   string | null;
  estimatedDurationMinutes?: number | null;
  dueDate?:                  string | null;
  maxMarks?:                 number | null;
}

export const fetchLecturesApi = (moduleId: number) =>
  api.get<{ data: ApiLecture[] }>(`/modules/${moduleId}/lectures`)
    .then((r) => r.data.data.map(mapLecture));

export const fetchLectureByIdApi = (id: number) =>
  api.get<{ data: ApiLecture }>(`/lectures/${id}`)
    .then((r) => mapLecture(r.data.data));

export const createLectureApi = (moduleId: number, payload: CreateLessonPayload) =>
  api.post(`/modules/${moduleId}/lectures`, payload).then((r) => r.data);

export const updateLectureApi = (id: number, payload: UpdateLessonPayload) =>
  api.patch(`/lectures/${id}`, payload).then((r) => r.data);

export const deleteLectureApi = (id: number) =>
  api.delete(`/lectures/${id}`).then((r) => r.data);
