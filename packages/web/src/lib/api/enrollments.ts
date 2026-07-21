import api from '../axios';

export type EnrollmentStatus = 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface StudentEnrollment {
  enrollmentId:         number;
  studentProfileId:     number;
  courseId:             number;
  courseName:           string;
  enrollmentStatus:     EnrollmentStatus;
  completionPercentage: number;
  assignedDate:         string | null;
  completedDate:        string | null;
}

export interface ApiEnrollment {
  enrollment_id:         number;
  student_profile_id:    number;
  course_id:             number;
  enrollment_status:     string;
  completion_percentage: string;
  assigned_date:         string | null;
  completed_date:        string | null;
  course: { course_id: number; course_name: string };
}

export const mapEnrollment = (e: ApiEnrollment): StudentEnrollment => ({
  enrollmentId:         e.enrollment_id,
  studentProfileId:     e.student_profile_id,
  courseId:             e.course_id,
  courseName:           e.course.course_name,
  enrollmentStatus:     e.enrollment_status as EnrollmentStatus,
  completionPercentage: parseFloat(e.completion_percentage),
  assignedDate:         e.assigned_date,
  completedDate:        e.completed_date,
});

export const fetchStudentEnrollments = (studentProfileId: number) =>
  api
    .get<{ success: boolean; data: ApiEnrollment[] }>(
      `/student-profiles/${studentProfileId}/enrollments`,
      { params: { limit: 100 } },
    )
    .then((r) => r.data.data.map(mapEnrollment));

export const createEnrollmentApi = (studentProfileId: number, courseId: number) =>
  api
    .post<{ success: boolean; data: ApiEnrollment }>(
      `/student-profiles/${studentProfileId}/enrollments`,
      { courseId },
    )
    .then((r) => mapEnrollment(r.data.data));
