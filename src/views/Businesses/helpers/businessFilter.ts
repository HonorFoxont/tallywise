import { type Organization } from '@/types';

const businessFilter = (organizations: Organization[], searchTerm: string, status: string) => {
  return organizations.filter((organization) => {
    const matchesSearch = organization.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = status === '' ? true : organization.isActive === (status === 'Active');

    return matchesSearch && matchesStatus;
  });
};

export default businessFilter;
