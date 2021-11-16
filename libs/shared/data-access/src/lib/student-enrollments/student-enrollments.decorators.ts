import { IsEnum, IsPositive } from 'class-validator';
import { StudentEnrollmentStatus } from './student-enrollments.types';

export function IsStudentEnrollmentId(): PropertyDecorator {
  return function (target, propertyKey) {
    IsPositive()(target, propertyKey);
  };
}

export function IsStudentEnrollmentStatus(): PropertyDecorator {
  return function (target, propertyKey) {
    IsEnum(StudentEnrollmentStatus)(target, propertyKey);
  };
}
