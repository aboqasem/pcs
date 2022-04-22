import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatedStudentEnrollmentDto,
  CreateStudentEnrollmentDto,
  UserRole,
} from '@pcs/shared-data-access';
import { config } from 'src/config/config';
import { CourseEntity } from 'src/db/entities/course.entity';
import { UserEntity } from 'src/db/entities/user.entity';
import { StudentEnrollmentsRepository } from 'src/db/repositories/student-enrollment.repository';
import { CoursesService } from 'src/modules/courses/courses.service';
import { EmailService } from 'src/modules/email/email.service';
import { EmailTemplate } from 'src/modules/email/email.types';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class StudentEnrollmentsService {
  constructor(
    private readonly studentsRepository: StudentEnrollmentsRepository,
    private readonly coursesService: CoursesService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  studentIsEnrolled(studentId: UserEntity['id'], courseId: CourseEntity['id']): Promise<boolean> {
    return this.studentsRepository
      .count({
        studentId,
        courseId,
      })
      .then(Boolean);
  }

  async addAndInformInstructorCourseStudent(
    instructorId: UserEntity['id'],
    courseId: CourseEntity['id'],
    dto: CreateStudentEnrollmentDto,
  ): Promise<CreatedStudentEnrollmentDto> {
    const student = await this.usersService.getActiveUser(
      {
        id: dto.studentId,
        role: UserRole.Student,
      },
      ['email', 'fullName'],
    );

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const course = await this.coursesService.getInstructorCourse(instructorId, courseId, ['title']);

    if (await this.studentIsEnrolled(dto.studentId, courseId)) {
      throw new BadRequestException('Student is already enrolled in this course');
    }

    const {
      identifiers: [identifier],
    } = await this.studentsRepository.insert({ ...dto, courseId });

    this.emailService.send({
      template: EmailTemplate.CourseEnrollment,
      to: student.email,
      data: {
        fullName: student.fullName,
        courseTitle: course.title,
        courseUrl: config.APP_COURSE_URL.replace('[courseId]', identifier!.id),
      },
    });

    return { id: identifier!.id as CreatedStudentEnrollmentDto['id'] };
  }
}
