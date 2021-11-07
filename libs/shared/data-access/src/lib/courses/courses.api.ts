import { CourseDto, CreateCourseDto, CreatedCourseDto } from './courses.classes';

export type CoursesGetOwnCoursesData = CourseDto[];

export type CoursesGetOwnCourseData = CourseDto;

export class CoursesCreateOwnCourseBody extends CreateCourseDto {}
export type CoursesCreateOwnCourseData = CreatedCourseDto;
