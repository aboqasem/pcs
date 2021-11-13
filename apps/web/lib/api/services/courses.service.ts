import { BffPath } from '@/lib/constants/shared.constants';
import {
  CourseDto,
  CoursesCreateOwnCourseBody,
  HttpException,
  MaterialDto,
  MaterialsCreateOwnMaterialBody,
  TCoursesCreateOwnCourseData,
  TCoursesGetOwnCourseData,
  TCoursesGetOwnCoursesData,
  TMaterialsCreateOwnMaterialData,
  TMaterialsGetOwnMaterialData,
  TMaterialsGetOwnMaterialsData,
  TReplace,
} from '@pcs/shared-data-access';
import { plainToClass } from 'class-transformer';
import toast from 'react-hot-toast';
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query';
import { bffAxios } from '../axios.config';

export const coursesQueryKeys = {
  all: ['courses'] as const,
  getOwnCourses: () => [...coursesQueryKeys.all, 'get', 'own'] as const,
  getOwnCourse: (courseId: string) => [...coursesQueryKeys.getOwnCourses(), courseId] as const,
  getOwnCourseMaterials: (courseId: string) =>
    [...coursesQueryKeys.getOwnCourse(courseId), 'materials'] as const,
  getOwnCourseMaterial: (courseId: string, materialId: string) =>
    [...coursesQueryKeys.getOwnCourseMaterials(courseId), materialId] as const,
};

export type TGetOwnCoursesQueryKey = ReturnType<typeof coursesQueryKeys.getOwnCourses>;

export type TGetOwnCourseQueryKey = ReturnType<typeof coursesQueryKeys.getOwnCourse>;

export type TGetOwnMaterialsQueryKey = ReturnType<typeof coursesQueryKeys.getOwnCourseMaterials>;

export type TGetOwnMaterialQueryKey = ReturnType<typeof coursesQueryKeys.getOwnCourseMaterial>;

export class CoursesService {
  static getOwnCourses = async (cookie?: string): Promise<TCoursesGetOwnCoursesData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiCoursesDto = TReplace<CourseDto, { beginsAt: string; endsAt: string }>[];

    return bffAxios
      .get<ApiCoursesDto>(BffPath.Courses, options)
      .then(({ data: courses }) => plainToClass(CourseDto, courses));
  };

  static getOwnCourse = async (
    courseId: CourseDto['id'],
    cookie?: string,
  ): Promise<TCoursesGetOwnCourseData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiCourseDto = TReplace<CourseDto, { beginsAt: string; endsAt: string }>;

    return bffAxios
      .get<ApiCourseDto>(BffPath.Course.replace('[courseId]', courseId), options)
      .then(({ data: course }) => plainToClass(CourseDto, course));
  };

  static createOwnCourse = async (
    body: CoursesCreateOwnCourseBody,
  ): Promise<TCoursesCreateOwnCourseData> => {
    return bffAxios
      .post<TCoursesCreateOwnCourseData>(BffPath.Courses, body)
      .then(({ data }) => data);
  };

  static getOwnCourseMaterials = async (
    courseId: CourseDto['id'],
    cookie?: string,
  ): Promise<TMaterialsGetOwnMaterialsData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiMaterialsDto = TReplace<MaterialDto, { beginsAt: string; endsAt: string }>[];

    return bffAxios
      .get<ApiMaterialsDto>(BffPath.CourseMaterials.replace('[courseId]', courseId), options)
      .then(({ data: materials }) => plainToClass(MaterialDto, materials));
  };

  static getOwnCourseMaterial = async (
    courseId: CourseDto['id'],
    materialId: MaterialDto['id'],
    cookie?: string,
  ): Promise<TMaterialsGetOwnMaterialData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiMaterialDto = TReplace<MaterialDto, { beginsAt: string; endsAt: string }>;

    return bffAxios
      .get<ApiMaterialDto>(
        BffPath.CourseMaterial.replace('[courseId]', courseId).replace('[materialId]', materialId),
        options,
      )
      .then(({ data: material }) => plainToClass(MaterialDto, material));
  };

  static createOwnCourseMaterial = async ({
    courseId,
    body,
  }: {
    courseId: CourseDto['id'];
    body: MaterialsCreateOwnMaterialBody;
  }): Promise<TMaterialsCreateOwnMaterialData> => {
    return bffAxios
      .post<TMaterialsCreateOwnMaterialData>(
        BffPath.CourseMaterials.replace('[courseId]', courseId),
        body,
      )
      .then(({ data }) => data);
  };
}

export function useOwnCoursesQuery<TData = TCoursesGetOwnCoursesData>(
  options?: UseQueryOptions<TCoursesGetOwnCoursesData, Error, TData, TGetOwnCoursesQueryKey>,
) {
  return useQuery(coursesQueryKeys.getOwnCourses(), () => CoursesService.getOwnCourses(), {
    onSettled: async (courses, error) => {
      if (error) {
        return toast.error(error.message, { id: 'coursesError' });
      }
    },
    ...options,
  });
}

export function useOwnCourseQuery<TData = TCoursesGetOwnCourseData>(
  courseId: string,
  options?: UseQueryOptions<TCoursesGetOwnCourseData, HttpException, TData, TGetOwnCourseQueryKey>,
) {
  return useQuery(
    coursesQueryKeys.getOwnCourse(courseId),
    () => CoursesService.getOwnCourse(courseId),
    {
      onSettled: async (_, error) => {
        if (error) {
          toast.error(error.message, { id: `courseError-${courseId}` });
        }
      },
      ...options,
    },
  );
}

export function useCreateOwnCourseMutation(
  options?: UseMutationOptions<
    TCoursesCreateOwnCourseData,
    HttpException,
    CoursesCreateOwnCourseBody
  >,
) {
  return useMutation(CoursesService.createOwnCourse, options);
}

export function useOwnCourseMaterialsQuery<TData = TMaterialsGetOwnMaterialsData>(
  courseId: CourseDto['id'],
  options?: UseQueryOptions<TMaterialsGetOwnMaterialsData, Error, TData, TGetOwnMaterialsQueryKey>,
) {
  return useQuery(
    coursesQueryKeys.getOwnCourseMaterials(courseId),
    () => CoursesService.getOwnCourseMaterials(courseId),
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

export function useOwnCourseMaterialQuery<TData = TMaterialsGetOwnMaterialData>(
  courseId: CourseDto['id'],
  materialId: MaterialDto['id'],
  options?: UseQueryOptions<
    TMaterialsGetOwnMaterialData,
    HttpException,
    TData,
    TGetOwnMaterialQueryKey
  >,
) {
  return useQuery(
    coursesQueryKeys.getOwnCourseMaterial(courseId, materialId),
    () => CoursesService.getOwnCourseMaterial(courseId, materialId),
    {
      onSettled: async (_, error) => {
        if (error) {
          toast.error(error.message, { id: `materialError-${materialId}` });
        }
      },
      ...options,
    },
  );
}

export function useCreateOwnCourseMaterialMutation(
  options?: UseMutationOptions<
    TMaterialsCreateOwnMaterialData,
    HttpException,
    {
      courseId: CourseDto['id'];
      body: MaterialsCreateOwnMaterialBody;
    }
  >,
) {
  return useMutation(CoursesService.createOwnCourseMaterial, options);
}
