'use client';

import { type ApiResponseType, get } from '@chup/core/shared';
import { useQuery } from '@tanstack/react-query';

import { adminUserUrl } from '../api/endpoints';
import { adminUserQueryKeys } from './queryKeys';
import type { StudentSearchResultType } from './types';

export const useGetSearchStudents = (q: string) =>
  useQuery({
    queryKey: adminUserQueryKeys.searchStudents(q),
    queryFn: async () => {
      const response = await get<ApiResponseType<StudentSearchResultType[]>>(
        adminUserUrl.searchStudents(q),
      );

      return response.data;
    },
    enabled: q.trim().length > 0,
  });
