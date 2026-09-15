import { type User } from '@/types/users';

type UserFilter = {
  roleFilter: string;
  isActive: boolean | null;
};

export default function userFilter(users: User[], searchTerm: string, filter: UserFilter) {
  return users.filter((user) => {
    const matchesSearch =
      searchTerm === '' ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filter.roleFilter === '' ? true : user.role === filter.roleFilter;

    const matchesStatus = filter.isActive === null ? true : user.isActive === filter.isActive;

    return matchesSearch && matchesRole && matchesStatus;
  });
}
