import { IsEnum, IsPositive } from 'class-validator';
import { EnrolledStudentStatus } from './student-enrollments.types';

export function IsStudentEnrollmentId(): PropertyDecorator {
  return function (target, propertyKey) {
    IsPositive()(target, propertyKey);
  };
}

export function IsStudentEnrollmentStatus(): PropertyDecorator {
  return function (target, propertyKey) {
    IsEnum(EnrolledStudentStatus)(target, propertyKey);
  };
}
