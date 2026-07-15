import api from '../axios';

interface ApiModule {
  module_id:          number;
  course_id:          number;
  module_name:        string;
  module_description: string | null;
  module_order:       number | null;
  created_at:         string;
  _count:             { lectures: number };
}

export interface CourseModule {
  id:           number;
  courseId:     number;
  name:         string;
  description:  string;
  order:        number;
  lectureCount: number;
}

const mapModule = (m: ApiModule): CourseModule => ({
  id:           m.module_id,
  courseId:     m.course_id,
  name:         m.module_name,
  description:  m.module_description ?? '',
  order:        m.module_order ?? 0,
  lectureCount: m._count.lectures,
});

export const fetchModulesApi = (courseId: number) =>
  api.get<{ data: ApiModule[] }>(`/courses/${courseId}/modules`)
    .then((r) => r.data.data.map(mapModule));

export const createModuleApi = (courseId: number, moduleName: string, moduleDescription?: string) =>
  api.post(`/courses/${courseId}/modules`, { moduleName, moduleDescription }).then((r) => r.data);

export const updateModuleApi = (id: number, moduleName: string, moduleDescription?: string) =>
  api.patch(`/modules/${id}`, { moduleName, moduleDescription }).then((r) => r.data);

export const deleteModuleApi = (id: number) =>
  api.delete(`/modules/${id}`).then((r) => r.data);
