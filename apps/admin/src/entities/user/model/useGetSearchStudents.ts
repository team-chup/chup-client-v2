'use client';

import { get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { adminUserUrl } from '../api/endpoints';
import { adminUserQueryKeys } from './queryKeys';
import type { StudentSearchResultType } from './types';

export const useGetSearchStudents = (q: string) =>
  useQuery({
    queryKey: adminUserQueryKeys.searchStudents(q),
    queryFn: () => get<StudentSearchResultType[]>(adminUserUrl.searchStudents(q)),
    enabled: q.trim().length > 0,
  });
