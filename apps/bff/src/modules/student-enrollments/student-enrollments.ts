import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEnrollmentsRepository } from 'src/db/repositories/student-enrollment.repository';
import { CoursesModule } from 'src/modules/courses/courses.module';
import { EmailModule } from 'src/modules/email/email.module';
import { UsersModule } from 'src/modules/users/users.module';
import { StudentEnrollmentsService } from './student-enrollments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StudentEnrollmentsRepository]),
    forwardRef(() => CoursesModule),
    UsersModule,
    EmailModule,
  ],
  providers: [StudentEnrollmentsService],
  controllers: [],
  exports: [TypeOrmModule, StudentEnrollmentsService],
})
export class StudentEnrollmentsModule {}
