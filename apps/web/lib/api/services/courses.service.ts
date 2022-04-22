import { BffPath } from '@/lib/constants/shared.constants';
import {
  CourseDto,
  CoursesAddStudentBody,
  CoursesCreateCourseBody,
  CoursesCreateMaterialBody,
  CoursesCreateMaterialQuestionBody,
  HttpError,
  MaterialDto,
  TCoursesAddStudentData,
  TCoursesAnnounceMaterialData,
  TCoursesCreateCourseData,
  TCoursesCreateMaterialData,
  TCoursesCreateMaterialQuestionData,
  TCoursesGetCourseData,
  TCoursesGetCoursesData,
  TCoursesGetMaterialData,
  TCoursesGetMaterialQuestionsData,
  TCoursesGetMaterialsData,
  TCoursesGetPeopleData,
  TReplace,
} from '@pcs/shared-data-access';
import { plainToInstance } from 'class-transformer';
import toast from 'react-hot-toast';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { bffAxios } from '../axios.config';

export const coursesQueryKeys = {
  all: ['courses'] as const,
  getCourses: () => [...coursesQueryKeys.all, 'get'] as const,
  getCourse: (courseId: string) => [...coursesQueryKeys.getCourses(), courseId] as const,
  getCourseMaterials: (courseId: string) =>
    [...coursesQueryKeys.getCourse(courseId), 'materials'] as const,
  getCourseMaterial: (courseId: string, materialId: string) =>
    [...coursesQueryKeys.getCourseMaterials(courseId), materialId] as const,
  getCourseMaterialQuestions: (courseId: string, materialId: string) =>
    [...coursesQueryKeys.getCourseMaterial(courseId, materialId), 'questions'] as const,
  getCoursePeople: (courseId: string) =>
    [...coursesQueryKeys.getCourse(courseId), 'people'] as const,
};

export type TGetCoursesQueryKey = ReturnType<typeof coursesQueryKeys.getCourses>;

export type TGetCourseQueryKey = ReturnType<typeof coursesQueryKeys.getCourse>;

export type TGetMaterialsQueryKey = ReturnType<typeof coursesQueryKeys.getCourseMaterials>;

export type TGetMaterialQueryKey = ReturnType<typeof coursesQueryKeys.getCourseMaterial>;

export type TGetQuestionsQueryKey = ReturnType<typeof coursesQueryKeys.getCourseMaterialQuestions>;

export type TGetPeopleQueryKey = ReturnType<typeof coursesQueryKeys.getCoursePeople>;

export class CoursesService {
  static getCourses = async (cookie?: string): Promise<TCoursesGetCoursesData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiCoursesDto = TReplace<CourseDto, { beginsAt: string; endsAt: string }>[];

    return bffAxios
      .get<ApiCoursesDto>(BffPath.Courses, options)
      .then(({ data: courses }) => plainToInstance(CourseDto, courses));
  };

  static getCourse = async (
    courseId: CourseDto['id'],
    cookie?: string,
  ): Promise<TCoursesGetCourseData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiCourseDto = TReplace<CourseDto, { beginsAt: string; endsAt: string }>;

    return bffAxios
      .get<ApiCourseDto>(BffPath.Course.replace('[courseId]', courseId), options)
      .then(({ data: course }) => plainToInstance(CourseDto, course));
  };

  static createCourse = async (
    body: CoursesCreateCourseBody,
  ): Promise<TCoursesCreateCourseData> => {
    return bffAxios.post<TCoursesCreateCourseData>(BffPath.Courses, body).then(({ data }) => data);
  };

  static getCourseMaterials = async (
    courseId: CourseDto['id'],
    cookie?: string,
  ): Promise<TCoursesGetMaterialsData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiMaterialsDto = TReplace<MaterialDto, { beginsAt: string; endsAt: string }>[];

    return bffAxios
      .get<ApiMaterialsDto>(BffPath.CourseMaterials.replace('[courseId]', courseId), options)
      .then(({ data: materials }) => plainToInstance(MaterialDto, materials));
  };

  static getCourseMaterial = async (
    courseId: CourseDto['id'],
    materialId: MaterialDto['id'],
    cookie?: string,
  ): Promise<TCoursesGetMaterialData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiMaterialDto = TReplace<MaterialDto, { beginsAt: string; endsAt: string }>;

    return bffAxios
      .get<ApiMaterialDto>(
        BffPath.CourseMaterial.replace('[courseId]', courseId).replace('[materialId]', materialId),
        options,
      )
      .then(({ data: material }) => plainToInstance(MaterialDto, material));
  };

  static announceCourseMaterial = async ({
    materialId,
    courseId,
  }: {
    courseId: CourseDto['id'];
    materialId: MaterialDto['id'];
  }): Promise<TCoursesAnnounceMaterialData> => {
    return bffAxios
      .patch<TCoursesAnnounceMaterialData>(
        BffPath.AnnounceCourseMaterial.replace('[courseId]', courseId).replace(
          '[materialId]',
          materialId,
        ),
      )
      .then(({ data }) => data);
  };

  static getCourseMaterialQuestions = async (
    courseId: CourseDto['id'],
    materialId: MaterialDto['id'],
    cookie?: string,
  ): Promise<TCoursesGetMaterialQuestionsData> => {
    const options = cookie ? { headers: { cookie } } : {};

    return bffAxios
      .get(
        BffPath.CourseMaterialQuestions.replace('[courseId]', courseId).replace(
          '[materialId]',
          materialId,
        ),
        options,
      )
      .then(({ data }) => data);
  };

  static createCourseMaterialQuestion = async ({
    materialId,
    courseId,
    body,
  }: {
    courseId: CourseDto['id'];
    materialId: MaterialDto['id'];
    body: CoursesCreateMaterialQuestionBody;
  }): Promise<TCoursesCreateMaterialQuestionData> => {
    return bffAxios
      .post<TCoursesCreateMaterialQuestionData>(
        BffPath.CourseMaterialQuestions.replace('[courseId]', courseId).replace(
          '[materialId]',
          materialId,
        ),
        body,
      )
      .then(({ data }) => data);
  };

  static createCourseMaterial = async ({
    courseId,
    body,
  }: {
    courseId: CourseDto['id'];
    body: CoursesCreateMaterialBody;
  }): Promise<TCoursesCreateMaterialData> => {
    return bffAxios
      .post<TCoursesCreateMaterialData>(
        BffPath.CourseMaterials.replace('[courseId]', courseId),
        body,
      )
      .then(({ data }) => data);
  };

  static getCoursePeople = async (
    courseId: CourseDto['id'],
    cookie?: string,
  ): Promise<TCoursesGetPeopleData> => {
    const options = cookie ? { headers: { cookie } } : {};

    return bffAxios
      .get(BffPath.CoursePeople.replace('[courseId]', courseId), options)
      .then(({ data }) => data);
  };

  static addCourseStudent = async ({
    courseId,
    body,
  }: {
    courseId: CourseDto['id'];
    body: CoursesAddStudentBody;
  }): Promise<TCoursesAddStudentData> => {
    return bffAxios
      .post<TCoursesAddStudentData>(BffPath.CourseStudents.replace('[courseId]', courseId), body)
      .then(({ data }) => data);
  };
}

export function useCoursesQuery<TData = TCoursesGetCoursesData>(
  options?: UseQueryOptions<TCoursesGetCoursesData, Error, TData, TGetCoursesQueryKey>,
) {
  return useQuery(coursesQueryKeys.getCourses(), () => CoursesService.getCourses(), {
    onSettled: async (courses, error) => {
      if (error) {
        return toast.error(error.message, { id: 'coursesError' });
      }
    },
    ...options,
  });
}

export function useCourseQuery<TData = TCoursesGetCourseData>(
  courseId: string,
  options?: UseQueryOptions<TCoursesGetCourseData, HttpError, TData, TGetCourseQueryKey>,
) {
  const queryClient = useQueryClient();

  return useQuery(coursesQueryKeys.getCourse(courseId), () => CoursesService.getCourse(courseId), {
    onSettled: async (_, error) => {
      if (error) {
        toast.error(error.message, { id: `courseError-${courseId}` });
      }
    },
    initialData: queryClient
      .getQueryData<TCoursesGetCoursesData>(coursesQueryKeys.getCourses())
      ?.find((course) => course.id === courseId),
    initialDataUpdatedAt: queryClient.getQueryState(coursesQueryKeys.getCourses())?.dataUpdatedAt,
    ...options,
  });
}

export function useCreateCourseMutation(
  options?: UseMutationOptions<TCoursesCreateCourseData, HttpError, CoursesCreateCourseBody>,
) {
  return useMutation(CoursesService.createCourse, options);
}

export function useCourseMaterialsQuery<TData = TCoursesGetMaterialsData>(
  courseId: CourseDto['id'],
  options?: UseQueryOptions<TCoursesGetMaterialsData, Error, TData, TGetMaterialsQueryKey>,
) {
  return useQuery(
    coursesQueryKeys.getCourseMaterials(courseId),
    () => CoursesService.getCourseMaterials(courseId),
    {
      onSettled: async (materials, error) => {
        if (error) {
          return toast.error(error.message, { id: 'materialsError' });
        }
      },
      ...options,
    },
  );
}

export function useCourseMaterialQuery<TData = TCoursesGetMaterialData>(
  courseId: CourseDto['id'],
  materialId: MaterialDto['id'],
  options?: UseQueryOptions<TCoursesGetMaterialData, HttpError, TData, TGetMaterialQueryKey>,
) {
  const queryClient = useQueryClient();
  const courseMaterialsQueryKey = coursesQueryKeys.getCourseMaterials(courseId);

  return useQuery(
    coursesQueryKeys.getCourseMaterial(courseId, materialId),
    () => CoursesService.getCourseMaterial(courseId, materialId),
    {
      onSettled: async (_, error) => {
        if (error) {
          toast.error(error.message, { id: `materialError-${materialId}` });
        }
      },
      initialData: queryClient
        .getQueryData<TCoursesGetMaterialsData>(courseMaterialsQueryKey)
        ?.find((material) => material.id === materialId),
      initialDataUpdatedAt: queryClient.getQueryState(courseMaterialsQueryKey)?.dataUpdatedAt,
      ...options,
    },
  );
}

export function useAnnounceCourseMaterialMutation(
  options?: UseMutationOptions<
    TCoursesAnnounceMaterialData,
    HttpError,
    {
      courseId: CourseDto['id'];
      materialId: MaterialDto['id'];
    }
  >,
) {
  const queryClient = useQueryClient();
  return useMutation(CoursesService.announceCourseMaterial, {
    ...options,
    onSettled: async (isAnnounced, error, { courseId }) => {
      if (error) {
        toast.error(error.message, { id: 'announceMaterialError' });
      }
      if (isAnnounced) {
        toast.success('Material has been announced!', { id: 'announceMaterialSuccess' });
        queryClient.refetchQueries(coursesQueryKeys.getCourseMaterials(courseId));
      }
    },
  });
}

export function useCreateCourseMaterialMutation(
  options?: UseMutationOptions<
    TCoursesCreateMaterialData,
    HttpError,
    {
      courseId: CourseDto['id'];
      body: CoursesCreateMaterialBody;
    }
  >,
) {
  return useMutation(CoursesService.createCourseMaterial, options);
}

export function useCourseMaterialQuestionsQuery<TData = TCoursesGetMaterialQuestionsData>(
  courseId: CourseDto['id'],
  materialId: MaterialDto['id'],
  options?: UseQueryOptions<TCoursesGetMaterialQuestionsData, Error, TData, TGetQuestionsQueryKey>,
) {
  return useQuery(
    coursesQueryKeys.getCourseMaterialQuestions(courseId, materialId),
    () => CoursesService.getCourseMaterialQuestions(courseId, materialId),
    {
      onSettled: async (_, error) => {
        if (error) {
          return toast.error(error.message, { id: 'questionsError' });
        }
      },
      ...options,
    },
  );
}

export function useCreateMaterialQuestionMutation(
  options?: UseMutationOptions<
    TCoursesCreateMaterialQuestionData,
    HttpError,
    {
      courseId: CourseDto['id'];
      materialId: MaterialDto['id'];
      body: CoursesCreateMaterialQuestionBody;
    }
  >,
) {
  return useMutation(CoursesService.createCourseMaterialQuestion, options);
}

export function useCoursePeopleQuery<TData = TCoursesGetPeopleData>(
  courseId: CourseDto['id'],
  options?: UseQueryOptions<TCoursesGetPeopleData, Error, TData, TGetPeopleQueryKey>,
) {
  return useQuery(
    coursesQueryKeys.getCoursePeople(courseId),
    () => CoursesService.getCoursePeople(courseId),
    {
      onSettled: async (people, error) => {
        if (error) {
          return toast.error(error.message, { id: 'peopleError' });
        }
      },
      ...options,
    },
  );
}

export function useAddCourseStudentMutation(
  options?: UseMutationOptions<
    TCoursesAddStudentData,
    HttpError,
    {
      courseId: CourseDto['id'];
      body: CoursesAddStudentBody;
    }
  >,
) {
  return useMutation(CoursesService.addCourseStudent, options);
}
