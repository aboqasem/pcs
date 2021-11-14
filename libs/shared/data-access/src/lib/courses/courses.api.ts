import { CreatedMaterialDto, CreateMaterialDto, MaterialDto } from '../materials/materials.classes';
import { CourseDto, CreateCourseDto, CreatedCourseDto } from './courses.classes';

export type TCoursesGetCoursesData = CourseDto[];

export type TCoursesGetCourseData = CourseDto;

export class CoursesCreateCourseBody extends CreateCourseDto {}
export type TCoursesCreateCourseData = CreatedCourseDto;

export type TCoursesGetMaterialsData = MaterialDto[];

export type TCoursesGetMaterialData = MaterialDto;

export class CoursesCreateMaterialBody extends CreateMaterialDto {}
export type TCoursesCreateMaterialData = CreatedMaterialDto;
