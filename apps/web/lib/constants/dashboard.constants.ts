import { UserRole } from '@pcs/shared-data-access';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi';
import { PagePath } from './shared.constants';

export const dashboardActions = {
  [UserRole.Admin]: [
    {
      title: 'Manage instructors',
      pathname: PagePath.Users,
      icon: FaChalkboardTeacher,
      iconColors: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Manage students',
      pathname: PagePath.Users,
      icon: HiUsers,
      iconColors: 'bg-blue-50 text-blue-700',
    },
  ],
  [UserRole.Instructor]: [
    {
      title: 'Manage courses',
      pathname: PagePath.Courses,
      icon: FaChalkboardTeacher,
      iconColors: 'bg-amber-50 text-amber-700',
    },
  ],
  [UserRole.Student]: [
    {
      title: 'Courses',
      pathname: PagePath.Courses,
      icon: FaChalkboardTeacher,
      iconColors: 'bg-amber-50 text-amber-700',
    },
  ],
};
