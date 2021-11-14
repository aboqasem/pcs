import { BffPath } from '@/lib/constants/shared.constants';
import {
  CourseDto,
  CoursesCreateCourseBody,
  HttpException,
  MaterialDto,
  MaterialsCreateMaterialBody,
  TCoursesCreateCourseData,
  TCoursesGetCourseData,
  TCoursesGetCoursesData,
  TMaterialsCreateMaterialData,
  TMaterialsGetMaterialData,
  TMaterialsGetMaterialsData,
  TReplace,
} from '@pcs/shared-data-access';
import { plainToClass } from 'class-transformer';
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
};

export type TGetCoursesQueryKey = ReturnType<typeof coursesQueryKeys.getCourses>;

export type TGetCourseQueryKey = ReturnType<typeof coursesQueryKeys.getCourse>;

export type TGetMaterialsQueryKey = ReturnType<typeof coursesQueryKeys.getCourseMaterials>;

export type TGetMaterialQueryKey = ReturnType<typeof coursesQueryKeys.getCourseMaterial>;

export class CoursesService {
  static getCourses = async (cookie?: string): Promise<TCoursesGetCoursesData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiCoursesDto = TReplace<CourseDto, { beginsAt: string; endsAt: string }>[];

    return bffAxios
      .get<ApiCoursesDto>(BffPath.Courses, options)
      .then(({ data: courses }) => plainToClass(CourseDto, courses));
  };

  static getCourse = async (
    courseId: CourseDto['id'],
    cookie?: string,
  ): Promise<TCoursesGetCourseData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiCourseDto = TReplace<CourseDto, { beginsAt: string; endsAt: string }>;

    return bffAxios
      .get<ApiCourseDto>(BffPath.Course.replace('[courseId]', courseId), options)
      .then(({ data: course }) => plainToClass(CourseDto, course));
  };

  static createCourse = async (
    body: CoursesCreateCourseBody,
  ): Promise<TCoursesCreateCourseData> => {
    return bffAxios.post<TCoursesCreateCourseData>(BffPath.Courses, body).then(({ data }) => data);
  };

  static getCourseMaterials = async (
    courseId: CourseDto['id'],
    cookie?: string,
  ): Promise<TMaterialsGetMaterialsData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiMaterialsDto = TReplace<MaterialDto, { beginsAt: string; endsAt: string }>[];

    return bffAxios
      .get<ApiMaterialsDto>(BffPath.CourseMaterials.replace('[courseId]', courseId), options)
      .then(({ data: materials }) => plainToClass(MaterialDto, materials));
  };

  static getCourseMaterial = async (
    courseId: CourseDto['id'],
    materialId: MaterialDto['id'],
    cookie?: string,
  ): Promise<TMaterialsGetMaterialData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiMaterialDto = TReplace<MaterialDto, { beginsAt: string; endsAt: string }>;

    return bffAxios
      .get<ApiMaterialDto>(
        BffPath.CourseMaterial.replace('[courseId]', courseId).replace('[materialId]', materialId),
        options,
      )
      .then(({ data: material }) => plainToClass(MaterialDto, material));
  };

  static createCourseMaterial = async ({
    courseId,
    body,
  }: {
    courseId: CourseDto['id'];
    body: MaterialsCreateMaterialBody;
  }): Promise<TMaterialsCreateMaterialData> => {
    return bffAxios
      .post<TMaterialsCreateMaterialData>(
        BffPath.CourseMaterials.replace('[courseId]', courseId),
        body,
      )
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
  options?: UseQueryOptions<TCoursesGetCourseData, HttpException, TData, TGetCourseQueryKey>,
) {
  const queryClient = useQueryClient();
  console.log();

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
  options?: UseMutationOptions<TCoursesCreateCourseData, HttpException, CoursesCreateCourseBody>,
) {
  return useMutation(CoursesService.createCourse, options);
}

export function useCourseMaterialsQuery<TData = TMaterialsGetMaterialsData>(
  courseId: CourseDto['id'],
  options?: UseQueryOptions<TMaterialsGetMaterialsData, Error, TData, TGetMaterialsQueryKey>,
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

export function useCourseMaterialQuery<TData = TMaterialsGetMaterialData>(
  courseId: CourseDto['id'],
  materialId: MaterialDto['id'],
  options?: UseQueryOptions<TMaterialsGetMaterialData, HttpException, TData, TGetMaterialQueryKey>,
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
        .getQueryData<TMaterialsGetMaterialsData>(courseMaterialsQueryKey)
        ?.find((material) => material.id === materialId),
      initialDataUpdatedAt: queryClient.getQueryState(courseMaterialsQueryKey)?.dataUpdatedAt,
      ...options,
    },
  );
}

export function useCreateCourseMaterialMutation(
  options?: UseMutationOptions<
    TMaterialsCreateMaterialData,
    HttpException,
    {
      courseId: CourseDto['id'];
      body: MaterialsCreateMaterialBody;
    }
  >,
) {
  return useMutation(CoursesService.createCourseMaterial, options);
}
