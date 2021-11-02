import { BffPath } from '@/lib/constants';
import {
  CourseDto,
  CreateCourseDto,
  CreatedCourseDto,
  HttpException,
  TReplace,
} from '@pcs/shared-data-access';
import { plainToClass } from 'class-transformer';
import toast from 'react-hot-toast';
import { useMutation, UseMutationOptions, useQuery, UseQueryOptions } from 'react-query';
import { bffAxios } from '../axios.config';

export const coursesQueryKeys = {
  all: ['courses'] as const,
  getOwnCourses: () => [...coursesQueryKeys.all, 'own', 'get', 'all'] as const,
  getOwnCourse: (courseId: string) => [...coursesQueryKeys.getOwnCourses(), courseId] as const,
};

export type TGetOwnCoursesData = CourseDto[];
export type TGetOwnCoursesQueryKey = ReturnType<typeof coursesQueryKeys.getOwnCourses>;

export type TGetOwnCourseData = CourseDto;
export type TGetOwnCourseQueryKey = ReturnType<typeof coursesQueryKeys.getOwnCourse>;

export type TCreateOwnCourseBody = CreateCourseDto;
export type TCreateOwnCourseData = CreatedCourseDto;

export class CoursesService {
  static getOwnCourses = async (cookie?: string): Promise<TGetOwnCoursesData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiCoursesDto = TReplace<CourseDto, { beginsAt: string; endsAt: string }>[];

    return bffAxios
      .get<ApiCoursesDto>(BffPath.Courses, options)
      .then(({ data: courses }) => plainToClass(CourseDto, courses));
  };

  static getOwnCourse = async (courseId: string, cookie?: string): Promise<TGetOwnCourseData> => {
    const options = cookie ? { headers: { cookie } } : {};

    type ApiCourseDto = TReplace<CourseDto, { beginsAt: string; endsAt: string }>;

    return bffAxios
      .get<ApiCourseDto>(`${BffPath.Courses}/${courseId}`, options)
      .then(({ data: course }) => plainToClass(CourseDto, course));
  };

  static createOwnCourse = async (body: TCreateOwnCourseBody): Promise<TCreateOwnCourseData> => {
    return bffAxios.post<TCreateOwnCourseData>(BffPath.Courses, body).then(({ data }) => data);
  };
}

export function useOwnCoursesQuery<TData = TGetOwnCoursesData>(
  options?: UseQueryOptions<TGetOwnCoursesData, Error, TData, TGetOwnCoursesQueryKey>,
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

export function useOwnCourseQuery<TData = TGetOwnCourseData>(
  courseId: string,
  options?: UseQueryOptions<TGetOwnCourseData, HttpException, TData, TGetOwnCourseQueryKey>,
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
  options?: UseMutationOptions<TCreateOwnCourseData, HttpException, TCreateOwnCourseBody>,
) {
  return useMutation(CoursesService.createOwnCourse, options);
}
