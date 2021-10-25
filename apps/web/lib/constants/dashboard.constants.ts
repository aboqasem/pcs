import { PagePath } from '@/lib/constants';
import { UserRole } from '@pcs/shared-data-access';
import { FaChalkboardTeacher } from 'react-icons/fa';
import { HiUsers } from 'react-icons/hi';

export const dashboardActions = {
  [UserRole.Admin]: [
    {
      title: 'Manage instructors',
      href: PagePath.Users,
      icon: FaChalkboardTeacher,
      iconColors: 'bg-yellow-50 text-yellow-700',
    },
    {
      title: 'Manage students',
      href: PagePath.Users,
      icon: HiUsers,
      iconColors: 'bg-blue-50 text-blue-700',
    },
  ],
  [UserRole.Instructor]: [
    {
      title: 'Manage courses',
      href: PagePath.Courses,
      icon: FaChalkboardTeacher,
      iconColors: 'bg-yellow-50 text-yellow-700',
    },
  ],
  [UserRole.Student]: [],
};
