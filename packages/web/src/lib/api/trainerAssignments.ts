import api from '../axios';

export type AssignmentType = 'STUDENT' | 'INSTITUTION';

export interface TrainerAssignmentSummary {
  trainer_assignment_id: number;
  assignment_type: AssignmentType;
  created_at: string;
  trainer: {
    employee_profile_id: number;
    user: { full_name: string; last_name: string; email: string };
  };
  course: { course_id: number; course_name: string };
  studentProfile: {
    student_profile_id: number;
    department: string | null;
    user: { full_name: string; last_name: string; email: string };
    institution: { institution_id: number; institution_name: string };
  } | null;
  institution: { institution_id: number; institution_name: string } | null;
}

export interface AccessibleStudent {
  assignmentId: number;
  assignmentType: AssignmentType;
  course: { id: number; name: string };
  student: {
    profileId: number;
    fullName: string;
    email: string;
    institution: string;
    department: string | null;
    enrollment: {
      id: number;
      status: string;
      completionPercentage: string;
      assignedDate: string | null;
      progresses: {
        lectureId: number;
        title: string;
        contentType: string;
        progressStatus: string;
      }[];
    } | null;
  };
}

export interface CreateTrainerAssignmentPayload {
  trainerEmployeeProfileId: number;
  courseId: number;
  assignmentType: AssignmentType;
  studentProfileId?: number;
  institutionId?: number;
}

export const createTrainerAssignmentApi = (payload: CreateTrainerAssignmentPayload) =>
  api
    .post<{ success: boolean; data: TrainerAssignmentSummary }>('/trainer-assignments', payload)
    .then((r) => r.data.data);

export const fetchTrainerAssignmentsApi = (filters?: {
  trainerId?: number;
  courseId?: number;
  assignmentType?: AssignmentType;
}) =>
  api
    .get<{ success: boolean; data: TrainerAssignmentSummary[] }>('/trainer-assignments', {
      params: filters,
    })
    .then((r) => r.data.data);

export const fetchAssignmentsByTrainerApi = (employeeProfileId: number) =>
  api
    .get<{ success: boolean; data: TrainerAssignmentSummary[] }>(
      `/trainer-assignments/trainer/${employeeProfileId}`,
    )
    .then((r) => r.data.data);

export const fetchAccessibleStudentsApi = (employeeProfileId: number) =>
  api
    .get<{ success: boolean; data: AccessibleStudent[] }>(
      `/trainer-assignments/trainer/${employeeProfileId}/students`,
    )
    .then((r) => r.data.data);

export const deleteTrainerAssignmentApi = (id: number) =>
  api.delete(`/trainer-assignments/${id}`).then((r) => r.data);
