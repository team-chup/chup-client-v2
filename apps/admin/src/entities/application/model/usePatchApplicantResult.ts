'use client';

import { type ApiResponseType, patch } from '@chup/core/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { applicantUrl } from '../api/endpoints';
import { applicantQueryKeys } from './queryKeys';
import type { ApplicationType, PatchApplicantResultReqType } from './types';

export const usePatchApplicantResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
      interviewAt,
    }: PatchApplicantResultReqType & { applicationId: number }) => {
      const response = await patch<ApiResponseType<ApplicationType>>(
        applicantUrl.patchApplicantResult(applicationId),
        { status, ...(interviewAt && { interviewAt }) },
      );

      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: applicantQueryKeys.all() }),
  });
};
