import { CourseDto, CreateCourseDto, CreatedCourseDto } from './courses.classes';

export type TCoursesGetCoursesData = CourseDto[];

export type TCoursesGetCourseData = CourseDto;

export class CoursesCreateCourseBody extends CreateCourseDto {}
export type TCoursesCreateCourseData = CreatedCourseDto;
