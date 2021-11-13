import { CourseDto, CreateCourseDto, CreatedCourseDto } from './courses.classes';

export type TCoursesGetOwnCoursesData = CourseDto[];

export type TCoursesGetOwnCourseData = CourseDto;

export class CoursesCreateOwnCourseBody extends CreateCourseDto {}
export type TCoursesCreateOwnCourseData = CreatedCourseDto;
