'use client';

import { type ApiResponseType, post } from '@chup/core/shared';
import { toast } from '@chup/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applicantQueryKeys, applicantUrl, type ApplicationType } from '@/entities/application';

import type { ManualApplicantRegistrationReqType } from './schema';

export const usePostManualApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: ManualApplicantRegistrationReqType) => {
      const response = await post<ApiResponseType<ApplicationType>>(
        applicantUrl.postManualApplicant(),
        { ...body, userId: Number(body.userId) },
      );

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: applicantQueryKeys.all() });
      toast.success('외부 지원 건이 등록되었습니다.');
    },
  });
};
