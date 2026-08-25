export const adminUserUrl = {
  searchStudents: (q: string) => {
    const searchParams = new URLSearchParams({ role: 'STUDENT', q });

    return `/api/admin/users?${searchParams.toString()}`;
  },
} as const;
