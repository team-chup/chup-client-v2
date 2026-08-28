'use client';

import { authUrl, post } from '@chup/core/shared';
import { toast } from '@chup/ui';
import { useMutation } from '@tanstack/react-query';

import { GA_EVENT, trackEvent } from '@/shared/lib/analytics';

export const usePostLogout = () =>
  useMutation({
    mutationFn: () => post(authUrl.postLogout()),
    onSuccess: () => {
      trackEvent(GA_EVENT.logout);
      location.href = '/signin';
    },
    onError: () => {
      toast.error('로그아웃에 실패했어요. 다시 시도해주세요.');
    },
  });
