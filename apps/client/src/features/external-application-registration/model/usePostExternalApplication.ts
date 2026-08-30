'use client';

import { type ApiResponseType, post } from '@chup/core/shared';
import { toast } from '@chup/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applicationQueryKeys, type ApplicationType, applicationUrl } from '@/entities/application';

import type { ExternalApplicationRegistrationReqType } from './schema';

export const usePostExternalApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: ExternalApplicationRegistrationReqType) => {
      const response = await post<ApiResponseType<ApplicationType>>(
        applicationUrl.postExternalApplication(),
        body,
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicationQueryKeys.all() });
      toast.success('외부 지원 내역이 등록되었습니다.');
    },
  });
};
