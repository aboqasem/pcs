import { IsEnum, IsPositive } from 'class-validator';
import { EnrolledStudentStatus } from './enrolled-students.types';

export function IsEnrolledStudentId(): PropertyDecorator {
  return function (target, propertyKey) {
    IsPositive()(target, propertyKey);
  };
}

export function IsEnrolledStudentStatus(): PropertyDecorator {
  return function (target, propertyKey) {
    IsEnum(EnrolledStudentStatus)(target, propertyKey);
  };
}
