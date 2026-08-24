export const adminUserQueryKeys = {
  all: () => ['admin-users'] as const,
  searchStudents: (q: string) => ['admin-users', 'search-students', q] as const,
} as const;
