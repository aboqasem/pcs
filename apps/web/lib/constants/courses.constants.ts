import { INavigationItem } from '@/components';
import { UserRole } from '@pcs/shared-data-access';

export const coursesNavigationItems: { [UserRole.Instructor]: INavigationItem[] } = {
  [UserRole.Instructor]: [] as INavigationItem[],
};
