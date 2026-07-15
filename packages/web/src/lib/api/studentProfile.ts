import api from '../axios';

export interface StudentProfileData {
  student_profile_id: number;
  user_id:            number;
  institution_id:     number;
  department:         string | null;
  academic_year:      number | null;
  form_status:        string;
  created_at:         string;
  updated_at:         string;
  user: {
    user_id:   number;
    full_name: string;
    last_name: string | null;
    email:     string;
  };
  institution: {
    institution_id:   number;
    institution_name: string;
  };
}

export const fetchMyStudentProfile = (userId: number) =>
  api
    .get<{ success: boolean; data: StudentProfileData }>(`/users/${userId}/student-profile`)
    .then((r) => r.data.data);
